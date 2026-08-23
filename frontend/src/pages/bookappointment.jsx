import { useState, useEffect } from "react";

const API_URL = "https://healthcare-appointment-hn2g.onrender.com/api";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingStep, setBookingStep] = useState("");
  const [calendarLink, setCalendarLink] = useState("");

  // NEW: booking loading state
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/doctors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load doctors"
        );
      }

      setDoctors(data);

    } catch (err) {
      console.error(err);
      setMessage("Failed to load doctors");
    }
  };

  const fetchAvailableSlots = async () => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      setTime("");
      return;
    }

    try {
      setLoadingSlots(true);
      setMessage("");
      setTime("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/appointments/doctor/${doctorId}/available-slots?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to load available slots"
        );
      }

      setAvailableSlots(data);

      if (data.length === 0) {
        setMessage(
          "No available slots for this date."
        );
      }

    } catch (err) {
      console.error(err);
      setAvailableSlots([]);
      setMessage(err.message);

    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [doctorId, date]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!time) {
    setMessage("Please select an available slot.");
    return;
  }

  try {
    setBooking(true);
    setMessage("");
    setCalendarLink("");
    setBookingStep(
      "Checking doctor availability..."
    );

    setTimeout(() => {
      setBookingStep(
        "Generating AI pre-visit summary for doctor..."
      );
    }, 1000);

    setTimeout(() => {
      setBookingStep(
        "Finalizing appointment..."
      );
    }, 3000);

    const token = localStorage.getItem("token");

    const appointmentTime = new Date(
      `${date}T${time}`
    ).toISOString();

    const res = await fetch(
      `${API_URL}/appointments`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          doctorId,
          appointmentTime,
          symptoms,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message ||
        "Failed to book appointment"
      );
    }

    setBookingStep(
      "Appointment booked successfully!"
    );

    setMessage(
      "Appointment booked successfully!"
    );
    const start = new Date(appointmentTime);

const end = new Date(
  start.getTime() + 30 * 60000
);

const formatGoogleDate = (date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z";

const selectedDoctor = doctors.find(
  (d) => d._id === doctorId
);

const calendarUrl =
  `https://calendar.google.com/calendar/render?action=TEMPLATE` +
  `&text=${encodeURIComponent(
    `Appointment with Dr. ${selectedDoctor?.name}`
  )}` +
  `&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}` +
  `&details=${encodeURIComponent(
    `Symptoms: ${symptoms}`
  )}`;

setCalendarLink(calendarUrl);
    setDoctorId("");
    setDate("");
    setTime("");
    setSymptoms("");
    setAvailableSlots([]);

  } catch (err) {

    setMessage(err.message);

  } finally {

    setTimeout(() => {
      setBooking(false);
      setBookingStep("");
    }, 1000);

  }
};

  return (
    <div className="book-container">

      <h2>Book Appointment</h2>
      {booking && (
  <div className="booking-status">

    <div className="booking-spinner"></div>

    <h3>Please wait...</h3>

    <p>{bookingStep}</p>

    <small>
      We are preparing your appointment and
      generating an AI pre-visit summary
      for the doctor.
    </small>

  </div>
)}
      {message && (
        <p className="message">
          {message}
        </p>
      )}
      {calendarLink && (
  <a
    href={calendarLink}
    target="_blank"
    rel="noopener noreferrer"
    className="calendar-btn"
  >
    📅 Add to Google Calendar
  </a>
)}
      <form
        className="book-form"
        onSubmit={handleSubmit}
      >

        {/* Doctor */}

        <select
          value={doctorId}
          onChange={(e) =>
            setDoctorId(e.target.value)
          }
          required
          disabled={booking}
        >

          <option value="">
            Select Doctor
          </option>

          {doctors.map((doctor) => (
            <option
              key={doctor._id}
              value={doctor._id}
            >
              Dr. {doctor.name} -{" "}
              {doctor.specialization}
            </option>
          ))}

        </select>

        {/* Date */}

        <input
          type="date"
          value={date}
          min={
            new Date()
              .toISOString()
              .split("T")[0]
          }
          onChange={(e) =>
            setDate(e.target.value)
          }
          required
          disabled={booking}
        />

        {/* Available Slots */}

        {doctorId && date && (
          <>
            <label>
              Available Time Slots
            </label>

            {loadingSlots ? (

              <p>
                Loading available slots...
              </p>

            ) : availableSlots.length === 0 ? (

              <p>
                No available slots.
              </p>

            ) : (

              <select
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
                required
                disabled={booking}
              >

                <option value="">
                  Select Available Slot
                </option>

                {availableSlots.map(
                  (slot) => (
                    <option
                      key={slot}
                      value={slot}
                    >
                      {slot}
                    </option>
                  )
                )}

              </select>
            )}
          </>
        )}

        {/* Symptoms */}

        <textarea
          placeholder="Enter symptoms"
          value={symptoms}
          onChange={(e) =>
            setSymptoms(e.target.value)
          }
          rows="4"
          disabled={booking}
        />

        {/* Submit */}

        <button
          type="submit"
          disabled={
            !doctorId ||
            !date ||
            !time ||
            booking
          }
        >
          {booking
            ? "Booking Appointment..."
            : "Book Appointment"}
        </button>

      </form>
    </div>
  );
}