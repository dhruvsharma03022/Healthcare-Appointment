import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setDoctors(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load doctors");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
        throw new Error(data.message);
      }

      setMessage("Appointment booked successfully!");

      setDoctorId("");
      setDate("");
      setTime("");
      setSymptoms("");

    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="book-container">
      <h2>Book Appointment</h2>

      {message && (
        <p className="message">{message}</p>
      )}

      <form
        className="book-form"
        onSubmit={handleSubmit}
      >
        <select
          value={doctorId}
          onChange={(e) =>
            setDoctorId(e.target.value)
          }
          required
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

        <input
          type="date"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
          required
        />

        <input
          type="time"
          value={time}
          onChange={(e) =>
            setTime(e.target.value)
          }
          required
        />

        <textarea
          placeholder="Enter symptoms"
          value={symptoms}
          onChange={(e) =>
            setSymptoms(e.target.value)
          }
          rows="4"
        />

        <button type="submit">
          Book Appointment
        </button>
      </form>
    </div>
  );
}