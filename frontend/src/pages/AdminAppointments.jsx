import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load appointments"
        );
      }

      setAppointments(data);

    } catch (error) {
      console.error(
        "Failed to fetch appointments:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status
  const updateStatus = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      // Refresh appointments after update
      fetchAppointments();

    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );

      alert(error.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return <h2>Loading appointments...</h2>;
  }

  return (
    <div className="appointments-page">
      <h1>Manage Appointments</h1>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((appointment) => (
          <div
            key={appointment._id}
            className="appointment-card"
          >
            <h3>
              Dr. {appointment.doctor?.name}
            </h3>

            <p>
              <strong>Specialization:</strong>{" "}
              {appointment.doctor?.specialization}
            </p>

            <p>
              <strong>Patient:</strong>{" "}
              {appointment.patient?.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {appointment.patient?.email}
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
              <div className="status-actions">
                <button
                  className="complete-btn"
                  onClick={() =>
                    updateStatus(
                      appointment._id,
                      "COMPLETED"
                    )
                  }
                >
                  Mark Completed
                </button>

                <button
                  className="cancel-btn"
                  onClick={() =>
                    updateStatus(
                      appointment._id,
                      "CANCELLED"
                    )
                  }
                >
                  Cancel Appointment
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminAppointments;