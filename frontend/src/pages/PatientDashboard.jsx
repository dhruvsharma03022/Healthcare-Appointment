import { useNavigate } from "react-router-dom";

function PatientDashboard() {
  const navigate = useNavigate();

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
          <div className="dashboard-card">
            <h3>📅 Upcoming Appointments</h3>
            <p>You have no upcoming appointments.</p>
            <button
  onClick={() =>
    navigate("/book-appointment")
  }
>
  Book Appointment
</button>
          </div>

          <div className="dashboard-card">
            <h3>👨‍⚕️ Find a Doctor</h3>
            <p>Search for doctors and available time slots.</p>
            <button onClick={() => navigate("/doctors")}>
  Find Doctor
</button>
          </div>

          <div className="dashboard-card">
            <h3>📋 Appointment History</h3>
            <p>View your previous appointments.</p>
            <button>View History</button>
          </div>

          <div className="dashboard-card">
            <h3>💊 Prescriptions</h3>
            <p>View your prescriptions and medications.</p>
            <button>View Prescriptions</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;