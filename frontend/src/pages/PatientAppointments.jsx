import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function PatientAppointments() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/appointments/patient/${patientId}`,
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
        "Failed to fetch patient appointments:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading appointments...</h2>;
  }

  return (
    <div className="appointments-page">
      <button
        className="back-btn"
        onClick={() => navigate("/admin/patients")}
      >
        ← Back to Patients
      </button>

      <h1>Patient Appointments</h1>

      {appointments.length === 0 ? (
        <p>This patient has no appointments.</p>
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
              <strong>Date & Time:</strong>{" "}
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
              {appointment.status}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default PatientAppointments;