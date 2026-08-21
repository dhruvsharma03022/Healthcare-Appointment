import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PatientDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/appointments/my",
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
  }, []);

  // Get all future BOOKED appointments
  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "BOOKED" &&
      new Date(appointment.appointmentTime) > new Date()
  );

  // Get the nearest upcoming appointment
  const nextAppointment = upcomingAppointments[0];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Healthcare Manager</h1>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, Patient 👋</h2>

          <p>
            Manage your appointments and healthcare information.
          </p>
        </div>

        <div className="dashboard-grid">

          {/* Upcoming Appointments */}
          <div className="dashboard-card">
            <h3>📅 Upcoming Appointments</h3>

            {loading ? (
              <p>Loading appointments...</p>
            ) : upcomingAppointments.length === 0 ? (
              <p>You have no upcoming appointments.</p>
            ) : (
              <>
                <p>
                  You have{" "}
                  <strong>
                    {upcomingAppointments.length}
                  </strong>{" "}
                  upcoming appointment
                  {upcomingAppointments.length > 1
                    ? "s"
                    : ""}.
                </p>

                {nextAppointment && (
                  <div className="next-appointment">
                    <p>
                      <strong>Next Appointment:</strong>
                    </p>

                    <p>
                      Dr.{" "}
                      {nextAppointment.doctor?.name}
                    </p>

                    <p>
                      {nextAppointment.doctor?.specialization}
                    </p>

                    <p>
                      {new Date(
                        nextAppointment.appointmentTime
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() =>
                navigate("/book-appointment")
              }
            >
              Book Appointment
            </button>
            <br></br>
            <br></br>
            <button
  onClick={() =>
    navigate("/my-appointments")
  }
>
  View My Appointments
</button>
          </div>

          {/* Find Doctor */}
          <div className="dashboard-card">
            <h3>👨‍⚕️ Find a Doctor</h3>

            <p>
              Search for doctors and available time slots.
            </p>

            <button
              onClick={() => navigate("/doctors")}
            >
              Find Doctor
            </button>
          </div>

          {/* Appointment History */}
          <div className="dashboard-card">
            <h3>📋 Appointment History</h3>

            <p>
              View your previous appointments.
            </p>

            <button
  onClick={() =>
    navigate("/patient/appointment-history")
  }
>
  Appointment History
</button>
          </div>

          {/* Prescriptions */}
          <div className="dashboard-card">
            <h3>💊 Prescriptions</h3>

            <p>
              View your prescriptions and medications.
            </p>

            <button
  onClick={() =>
    navigate("/patient/prescriptions")
  }
>
  View Prescription
</button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;