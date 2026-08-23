# Healthcare Appointment System

## Hosted link=**https://healthcare-appointment-nine.vercel.app/**

## About the Project

Healthcare Appointment System is a SaaS (Software as a Service) platform that helps a hospital or clinic manage its business by helping patients, doctors, and administration with appointments, prescriptions, and AI suggestions and helps administration manage doctors and patients.

The project has three roles: **Doctor**, **Patient**, and **Admin**.

- **Doctor** — can cancel appointments, give prescriptions, and add leave dates.
- **Patient** — can book appointments, and view prescriptions with post-visit AI summaries.
- **Admin** — can manage patients, add or delete doctors, and cancel appointments.

---

## Setup Guide

### As a Patient
1. Register at the login page with name, email, phone number, and password.
2. After login you'll land on a patient dashboard where you can book appointments, view your prescriptions, and more.

### As a Doctor
1. To start as a doctor, an admin must first create your doctor profile with your name, email, and phone number. The default password after creation is `123456`.
2. Log in with the default credentials, then change your password using "Forgot Password" afterward.
3. After login, you can view your upcoming, completed, and cancelled appointments, and add your leave dates no slots will be available for the doctor on those dates.

### As an Admin
1. Currently there is only one sample admin ID registered please find credentials in **test credentials.txt** file .
2. After logging in as admin, you can manage appointments and view hospital stats, such as number of appointments completed and appointments taken per doctor.
3. An admin can add or delete doctors, and manage a doctor's shift start/end time and appointment slot duration.

---

## `.env` Example

```env
PORT=5000
MONGO_URI=xxxxxx            # MongoDB connection string
JWT_SECRET=xxxxxx
GEMINI_API_KEY=xxxxx        # Gemini API key for pre-visit summary generation (LLM)
GROQ_API_KEY=xxxxxx         # Groq API key for post-visit summary generation (LLM)
BREVO_API_KEY=xxxxx         # To send emails to users
BREVO_SENDER_EMAIL=xxxx
```

---

## API Documentation

**Base URL:** `http://localhost:5000/api`
**Auth:** `Authorization: Bearer <token>` header (JWT, 7-day expiry). Obtained from `/auth/login` or `/auth/register`.
**Roles:** `PATIENT`, `DOCTOR`, `ADMIN`

### Auth — `/auth`

| Method | Endpoint | Access | Body |
|---|---|---|---|
| POST | `/register` | Public | `{ name, email, password, role, phone }` |
| POST | `/login` | Public | `{ email, password }` |
| GET | `/me` | Any (logged in) | — |
| POST | `/forgot-password` | Public | `{ email }` |
| PUT | `/reset-password/:token` | Public | `{ password }` |

**Password rules:** min 8 chars, 1 uppercase, 1 lowercase, 1 number.

Register/Login response:
```json
{ "token": "jwt...", "user": { "_id", "name", "email", "role" } }
```
Reset link expires in 15 minutes. Forgot-password always returns 200 (doesn't reveal whether the email exists).

### Doctors — `/doctors`

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/` | Public | Query: `?name=&specialization=` (regex, case-insensitive) |
| GET | `/me` | DOCTOR | Logged-in doctor's own profile |
| GET | `/leave-dates` | DOCTOR | Own leave dates |
| POST | `/leave-dates` | DOCTOR | `{ date }` |
| DELETE | `/leave-dates` | DOCTOR | `{ date }` |
| POST | `/` | ADMIN | Create doctor (see body below) |
| PUT | `/:id/leave` | ADMIN | Add leave date for a doctor: `{ date }` |
| PUT | `/:id` | ADMIN | Update doctor fields |
| DELETE | `/:id` | ADMIN | Delete doctor |

**Create doctor body:**
```json
{ "name", "email", "specialization", "workingHours": { "start", "end" }, "slotDuration", "leaveDates": [] }
```
Creates both a `User` (role `DOCTOR`, default password `123456`) and a `Doctor` profile.

**Doctor model:** `name, email, specialization, workingHours{start,end}, slotDuration (default 30 min), leaveDates: [string]`

### Patients — `/patients`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | ADMIN — all users with role `PATIENT` |

### Appointments — `/appointments`

**POST `/`** — PATIENT — book appointment
Body: `{ "doctorId", "appointmentTime" (ISO datetime), "symptoms" }`
Validates, in order: doctor exists → not a leave date → not in the past → within doctor's working hours (IST) → aligns to `slotDuration` grid → slot not already `BOOKED`. Auto-generates `preVisitSummary` (best-effort; failure doesn't block booking). Sends confirmation emails to patient + doctor (non-blocking).
Errors: 404 doctor not found; 400 for each validation failure above (specific messages); 500 on unexpected error (also catches duplicate-key race as 400 "slot already booked").
Response: `201 { message, appointment }`

**GET `/my`** — PATIENT
Returns own **upcoming** appointments only: `status: BOOKED` and `appointmentTime > now`, populated with `doctor.name/specialization`, sorted ascending.

**GET `/my/history`** — PATIENT
All own appointments (any status), sorted descending by time.

**PUT `/:id/cancel`** — PATIENT, ADMIN
Patients may only cancel their own appointment (403 otherwise). Only `BOOKED` appointments can be cancelled (400 otherwise). Sets status to `CANCELLED`, sends cancellation emails to both parties.
Response: `200 { message, appointment }`

**GET `/doctor/:doctorId/available-slots`** — PATIENT
Query: `?date=YYYY-MM-DD` (required, 400 if missing). Returns `[]` if doctor is on leave that date. Otherwise generates all slots within working hours at `slotDuration` steps (IST), excluding already-booked and past slots.
Response: `200 ["HH:MM", ...]`

**GET `/doctor/:doctorId`** — ADMIN, DOCTOR
If caller is a DOCTOR, they may only fetch their **own** appointments (403 if `doctorId` doesn't match). Populates `patient.name/email` and `doctor.name/specialization`, sorted ascending.

**PUT `/:id/status`** — ADMIN, DOCTOR
Body: `{ "status" }`, must be one of `BOOKED | COMPLETED | CANCELLED` (400 otherwise). Doctors may only update their own appointments (403 otherwise). If set to `CANCELLED`, sends cancellation emails.
Response: `200 { message, appointment }`

**GET `/`** — ADMIN
All appointments, populated with patient + doctor, sorted ascending.

**GET `/patient/:patientId`** — ADMIN
All appointments for a given patient, populated with doctor + patient, sorted ascending.

**Appointment model:**
```json
{
  "patient": "ObjectId(User)",
  "doctor": "ObjectId(Doctor)",
  "appointmentTime": "ISODate",
  "symptoms": "string",
  "clinicalNotes": "string",
  "preVisitSummary": { "urgency": "Low|Medium|High", "chiefComplaint": "string", "suggestedQuestions": ["string"] },
  "postVisitSummary": { "summary": "string", "medicationSchedule": [{ "medicine", "dosage", "duration" }], "followUpSteps": ["string"] },
  "status": "BOOKED | COMPLETED | CANCELLED"
}
```
A doctor cannot have two `BOOKED` appointments at the same `appointmentTime` (unique partial index).

### Prescriptions — `/prescriptions`

| Method | Endpoint | Access | Body |
|---|---|---|---|
| POST | `/` | DOCTOR | `{ appointmentId, diagnosis, medicines: [{name,dosage,duration}], instructions, clinicalNotes }` |
| GET | `/my` | PATIENT | Own prescriptions (populated with doctor + appointment) |

Creating a prescription also: verifies the doctor owns the appointment, auto-generates an AI `postVisitSummary`, saves `clinicalNotes` on the appointment, and marks the appointment `COMPLETED`.

Response:
```json
{ "message": "...", "prescription": {...}, "postVisitSummary": {...} }
```

### Admin — `/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | ADMIN | `{ message: "Welcome Admin" }` |
| GET | `/reports` | ADMIN | Aggregate stats (see below) |
| GET | `/patients` | ADMIN | All patients |

**`/reports` response:**
```json
{
  "totalDoctors": 0,
  "totalPatients": 0,
  "totalAppointments": 0,
  "bookedAppointments": 0,
  "completedAppointments": 0,
  "cancelledAppointments": 0,
  "totalPrescriptions": 0,
  "doctorPerformance": [{ "_id": { "_id", "name" }, "totalAppointments": 0 }]
}
```

## Database Schema

### Appointment

The `Appointment` schema stores and manages appointment-related information between patients and doctors.

| Field | Type | Required | Description |
|---|---|---|---|
| `patient` | ObjectId → `User` | Yes | The patient who booked the appointment. |
| `doctor` | ObjectId → `Doctor` | Yes | The doctor assigned to the appointment. |
| `appointmentTime` | Date | Yes | Scheduled date and time. |
| `symptoms` | String | Yes | Symptoms/concerns entered by the patient while booking. |
| `clinicalNotes` | String | No | Clinical observations added during consultation. |
| `preVisitSummary` | Object | No | AI-generated summary created before consultation — see below. |
| `postVisitSummary` | Object | No | AI-generated summary created after consultation — see below. |
| `status` | String | Default `BOOKED` | One of `BOOKED`, `COMPLETED`, `CANCELLED`. |

**`preVisitSummary`:**
- `urgency` — priority level of the patient's condition (`Low`, `Medium`, `High`).
- `chiefComplaint` — primary health concern identified from symptoms.
- `suggestedQuestions` — list of questions that may help the doctor during consultation.

**`postVisitSummary`:**
- `summary` — summary of the consultation and doctor's assessment.
- `medicationSchedule` — prescribed medicines, each with `medicine`, `dosage`, `duration`.
- `followUpSteps` — recommended actions/follow-up instructions for the patient.

**Timestamps:** `timestamps: true` adds `createdAt` and `updatedAt` automatically.

**Unique appointment constraint:** a compound index on `doctor` + `appointmentTime` with a `partialFilterExpression` (`status: BOOKED`) ensures a doctor cannot have two active (`BOOKED`) appointments at the same time.

### Doctor

| Field | Type | Required/Default | Description |
|---|---|---|---|
| `name` | String | Yes | Full name of the doctor. |
| `email` | String | Yes, unique | No two doctors can share an email. |
| `specialization` | String | Yes | e.g. General Physician, Cardiologist, Dermatologist, Orthopedic Specialist. |
| `workingHours.start` / `.end` | String | Yes | Daily availability, e.g. `"09:00"` – `"17:00"`. |
| `slotDuration` | Number | Default `30` | Length of each appointment slot in minutes. |
| `leaveDates` | Array\<String\> | — | Dates the doctor is unavailable; used to block bookings. |

### Prescription

The `Prescription` schema stores prescription details generated by doctors after a patient consultation, linked to the patient, doctor, and corresponding appointment.

| Field | Type | Required | Description |
|---|---|---|---|
| `patient` | ObjectId → `User` | Yes | Patient the prescription is for. |
| `doctor` | ObjectId → `Doctor` | Yes | Doctor who created the prescription. |
| `appointment` | ObjectId → `Appointment` | Yes | Links the prescription to the consultation. |
| `diagnosis` | String | Yes | Diagnosis provided by the doctor. |
| `medicines` | Array | Yes | List of medicines — each with `name`, `dosage`, `duration` (all required). |
| `instructions` | String | No | Additional care instructions/guidance. |

Example medicine entry:
```json
{ "name": "Medicine Name", "dosage": "Twice daily", "duration": "5 days" }
```

**Timestamps:** `createdAt` and `updatedAt` via `timestamps: true`.

### User

Supports different user types — patients, doctors, and administrators.

| Field | Type | Required/Default | Description |
|---|---|---|---|
| `name` | String | Yes | Full name of the user. |
| `email` | String | Yes, unique | Prevents duplicate registrations. |
| `password` | String | Yes | Used for authentication (stored hashed). |
| `role` | String | Default `PATIENT` | One of `PATIENT`, `DOCTOR`, `ADMIN`. |
| `resetPasswordToken` | String | No | Token issued during password reset. |
| `resetPasswordExpires` | Date | No | Expiration time of the reset token. |

**Role capabilities:**
- **PATIENT** — register, book appointments, view prescriptions and medical info.
- **DOCTOR** — manage appointments, add clinical notes/diagnoses, create prescriptions.
- **ADMIN** — manage users, doctors, appointments, and system-level operations.

---

## LLM Prompts

### 1. Pre-Visit Summary

```
Analyse the patient's symptoms and create a pre-visit summary
for the doctor.

Symptoms:
${symptoms}

Return:

1. Urgency level (Low / Medium / High)
2. Chief complaint
3. Exactly three suggested questions that the DOCTOR should ask
   the PATIENT to gather more information about the symptoms.

Important:
- The suggested questions must be written from the doctor's perspective.
- Each suggested question should be directed to the patient.
- Do NOT write questions that the patient should ask the doctor.
- Do not make a definitive diagnosis.
- The urgency level is only an AI-generated aid.
- Do not provide emergency instructions.
- Return ONLY valid JSON.

Required format:

{
    "urgency": "Low",
    "chiefComplaint": "...",
    "suggestedQuestions": [
        "...",
        "...",
        "..."
    ]
}
```

### 2. Post-Visit Summary

```
Create a patient-friendly post-visit summary based only on
the consultation information below and make it of at least 100 words.

Clinical Notes:
${clinicalNotes}

Diagnosis:
${diagnosis}

Medicines:
${JSON.stringify(medicines)}

Instructions:
${instructions}

Important:
- Do not add information that was not provided.
- Do not make new diagnoses.
- Keep the language simple and patient-friendly.
- Do not provide emergency instructions.
- Return ONLY valid JSON.

Required format:

{
  "summary": "...",

  "medicationSchedule": [
    {
      "medicine": "...",
      "dosage": "...",
      "duration": "..."
    }
  ],

  "followUpSteps": [
    "...",
    "..."
  ]
}
```

---

## Google Calendar Integration

1. Add calendar state in the book-appointment component:
   ```js
   const [calendarLink, setCalendarLink] = useState("");
   ```
2. Build the Google Calendar event URL:
   ```js
   const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE`
   ```
3. Set the event title from the appointment context:
   ```js
   `&text=${encodeURIComponent(`Appointment with Dr. ${selectedDoctor?.name}`)}`
   ```
4. Set the start and end time:
   ```js
   `&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}`
   ```
5. Add the event description:
   ```js
   `&details=${encodeURIComponent(`Symptoms: ${symptoms}`)}`
   ```
6. Generate the final link and open it on the frontend:
   ```js
   window.open(calendarUrl, "_blank");
   ```

---

## System Design

**Deployment:**
- Backend → Render
- Frontend → Render / Vercel
- Database → MongoDB Atlas

The Healthcare Appointment System follows a client-server architecture using React, Express, and MongoDB. Patients interact through a React frontend, while business logic is handled by Express APIs. MongoDB stores users, doctors, appointments, and prescriptions.

### How key issues were handled

**1. Gemini rate-limit handling**
Groq's API is used as a fail-over for pre-visit summary generation if a Gemini request errors out, the request is forwarded to Groq. The same fail-over pattern applies to post-visit summaries.

**2. Double-booking prevention**
Before creating an appointment, the backend checks whether another `BOOKED` appointment already exists for the selected doctor and time slot.

A compound index on `doctor` + `appointmentTime`, scoped to `status: BOOKED` via a partial filter, backs this up at the database level: if two people attempt to book the same slot simultaneously, MongoDB itself guarantees that only one document can exist with the same doctor + appointmentTime + `BOOKED` status.

**3. Doctor leave conflict handling**
1. A doctor manages leave dates from their dashboard; each addition is sent to the backend.
2. The backend finds the logged-in doctor and appends the date to their `leaveDates`.
3. When a patient attempts to book on that date, the following check runs:
   ```js
   if (doctor.leaveDates.includes(appointmentDate)) {
       return res.status(400).json({
           message: "Doctor is on leave on this date"
       });
   }
   ```
   If true, booking is blocked and no slots are shown.

**4. Slot availability management**
Available slots are generated dynamically using:
- Doctor working hours
- Slot duration
- Existing booked appointments
- Doctor leave dates

Booked slots are removed from the generated availability list before being shown to patients, and past time slots are filtered out ensuring patients only see valid appointment options.

**5. Notification failure handling**
Appointment creation is independent of notification delivery. If email notifications fail due to SMTP or third-party service outages, appointment data is still stored successfully. Notification errors are logged separately and don't affect appointment status preventing user-facing failures caused by external services.

**6. Scalability**
The architecture separates frontend, backend, database, and AI services, allowing each component to scale independently. MongoDB indexes, stateless Express APIs, and external AI services support future growth without major architectural changes.