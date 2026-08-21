import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/appointments/my/history`,
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
          "Failed to load appointment history"
        );
      }

      setAppointments(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading appointment history...</h2>;
  }

  return (
    <div className="appointments-page">

      <h1>Appointment History</h1>

      {appointments.length === 0 ? (
        <p>No appointment history found.</p>
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

          </div>

        ))
      )}

    </div>
  );
}

export default AppointmentHistory;