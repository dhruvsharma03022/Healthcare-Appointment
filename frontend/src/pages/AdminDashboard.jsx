import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
const [loading, setLoading] = useState(true);
const [doctors, setDoctors] = useState([]);
useEffect(() => {
  const fetchDoctors = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "https://healthcare-appointment-hn2g.onrender.com/api/doctors",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || "Failed to fetch doctors"
      );
    }

    setDoctors(data);
  } catch (error) {
    console.error(
      "Failed to fetch doctors:",
      error
    );
  }
};
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://healthcare-appointment-hn2g.onrender.com/api/appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch appointments"
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

  fetchAppointments();
  fetchDoctors();
}, []);
const totalDoctors = doctors.length;
const totalAppointments = appointments.length;

const bookedAppointments = appointments.filter(
  (appointment) =>
    appointment.status === "BOOKED"
).length;

const completedAppointments = appointments.filter(
  (appointment) =>
    appointment.status === "COMPLETED"
).length;

const cancelledAppointments = appointments.filter(
  (appointment) =>
    appointment.status === "CANCELLED"
).length;
  return (
    <div className="dashboard">
      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Admin Dashboard 👨‍💼</h2>
          <p>
            Manage patients, doctors, and appointments.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
  <h3>📅 Appointments</h3>

  {loading ? (
    <p>Loading appointment statistics...</p>
  ) : (
    <>
      <p>
        <strong>Total:</strong> {totalAppointments}
      </p>

      <p>
        <strong>Booked:</strong> {bookedAppointments}
      </p>

      <p>
        <strong>Completed:</strong> {completedAppointments}
      </p>

      <p>
        <strong>Cancelled:</strong> {cancelledAppointments}
      </p>
    </>
  )}

  <button
    onClick={() =>
      navigate("/admin/appointments")
    }
  >
    Manage Appointments
  </button>
</div>

          <div className="dashboard-card">
  <h3>👨‍⚕️ Doctors</h3>

  <p>
    <strong>Total Doctors:</strong>{" "}
    {doctors.length}
  </p>

  <p>
    Add, remove, and manage doctors.
  </p>

  <button
    onClick={() => navigate("/admin/doctors")}
  >
    Manage Doctors
  </button>
</div>

                    <div className="dashboard-card">
            <h3>🧑‍🤝‍🧑 Patients</h3>
            <p>
              View and manage registered patients.
            </p>
            <button
  onClick={() => navigate("/admin/patients")}
>
  Manage Patients
</button>
          </div>

          <div className="dashboard-card">
            <h3>📊 Reports</h3>
            <p>
              View healthcare system statistics.
            </p>
            <button onClick={() => navigate("/admin/reports")}>View Reports</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;