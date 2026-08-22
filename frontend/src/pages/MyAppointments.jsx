import { useEffect, useState } from "react";

const API_URL = "https://healthcare-appointment-hn2g.onrender.com/api";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/appointments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const cancelAppointment = async (appointmentId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/appointments/${appointmentId}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || "Failed to cancel appointment"
      );
    }

    // Refresh appointments after cancellation
    fetchAppointments();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
  if (loading) {
    return <h2>Loading appointments...</h2>;
  }

  return (
    <div className="appointments-page">
      <h1>My Appointments</h1>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((appointment) => (
          <div
            key={appointment._id}
            className="appointment-card"
          >
            <h3>
              {appointment.doctor?.name}
            </h3>

            <p>
              <strong>Specialization:</strong>{" "}
              {appointment.doctor?.specialization}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                appointment.appointmentTime
              ).toLocaleString()}
            </p>

            <p>
              <strong>Symptoms:</strong>{" "}
              {appointment.symptoms}
            </p>

            <p>
  <strong>Status:</strong>{" "}
  <span
    className={`status-badge ${appointment.status.toLowerCase()}`}
  >
    {appointment.status}
  </span>
</p>
            {appointment.status === "BOOKED" && (
  <button
    className="cancel-btn"
    onClick={() =>
      cancelAppointment(appointment._id)
    }
  >
    Cancel Appointment
  </button>
)}
          </div>
        ))
      )}
    </div>
  );
}

export default MyAppointments;