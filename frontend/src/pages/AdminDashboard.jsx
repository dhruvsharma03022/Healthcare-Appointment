function AdminDashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Healthcare Manager</h1>

        <button className="logout-btn">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Admin Dashboard 👨‍💼</h2>
          <p>
            Manage patients, doctors, and appointments.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>👥 Patients</h3>
            <p>
              View and manage registered patients.
            </p>
            <button>Manage Patients</button>
          </div>

          <div className="dashboard-card">
            <h3>👨‍⚕️ Doctors</h3>
            <p>
              Add, remove, and manage doctors.
            </p>
            <button>Manage Doctors</button>
          </div>

          <div className="dashboard-card">
            <h3>📅 Appointments</h3>
            <p>
              View and manage all appointments.
            </p>
            <button>Manage Appointments</button>
          </div>

          <div className="dashboard-card">
            <h3>📊 Reports</h3>
            <p>
              View healthcare system statistics.
            </p>
            <button>View Reports</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;