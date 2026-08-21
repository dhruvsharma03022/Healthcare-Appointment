import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("UPCOMING");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // =========================
  // FILTER APPOINTMENTS
  // =========================

  const now = new Date();

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "BOOKED" &&
      new Date(appointment.appointmentTime) > now
  );

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "COMPLETED"
  );

  const cancelledAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "CANCELLED"
  );

  let displayedAppointments = [];

  if (activeTab === "UPCOMING") {
    displayedAppointments = upcomingAppointments;
  } else if (activeTab === "COMPLETED") {
    displayedAppointments = completedAppointments;
  } else if (activeTab === "CANCELLED") {
    displayedAppointments = cancelledAppointments;
  }

  // =========================
  // FETCH APPOINTMENTS
  // =========================

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      // Get actual Doctor document
      const doctorRes = await fetch(
        `${API_URL}/doctors/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const doctorData =
        await doctorRes.json();

      if (!doctorRes.ok) {
        throw new Error(
          doctorData.message ||
            "Failed to fetch doctor profile"
        );
      }

      // Get doctor's appointments
      const res = await fetch(
        `${API_URL}/appointments/doctor/${doctorData._id}`,
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
            "Failed to fetch appointments"
        );
      }

      setAppointments(data);

    } catch (error) {
      console.error(
        "Failed to fetch doctor appointments:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (
    appointmentId,
    status
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/appointments/${appointmentId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      // Refresh appointments
      fetchAppointments();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  useEffect(() => {
    fetchAppointments();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <h2>
        Loading appointments...
      </h2>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <h1>
          Healthcare Manager
        </h1>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="dashboard-content">

        {/* WELCOME */}

        <div className="welcome-section">

          <h2>
            Welcome, Dr. {user.name} 👨‍⚕️
          </h2>

          <p>
            Manage your patient appointments.
          </p>

        </div>

        {/* APPOINTMENT TABS */}

        <div className="appointment-tabs">

          <button
            className={
              activeTab === "UPCOMING"
                ? "active-tab"
                : ""
            }
            onClick={() =>
              setActiveTab("UPCOMING")
            }
          >
            Upcoming (
            {upcomingAppointments.length}
            )
          </button>

          <button
            className={
              activeTab === "COMPLETED"
                ? "active-tab"
                : ""
            }
            onClick={() =>
              setActiveTab("COMPLETED")
            }
          >
            Completed (
            {completedAppointments.length}
            )
          </button>

          <button
            className={
              activeTab === "CANCELLED"
                ? "active-tab"
                : ""
            }
            onClick={() =>
              setActiveTab("CANCELLED")
            }
          >
            Cancelled (
            {cancelledAppointments.length}
            )
          </button>

        </div>

        {/* APPOINTMENTS */}

        <div className="dashboard-card">

          <h3>
            {activeTab === "UPCOMING" &&
              "Upcoming Appointments"}

            {activeTab === "COMPLETED" &&
              "Completed Appointments"}

            {activeTab === "CANCELLED" &&
              "Cancelled Appointments"}
          </h3>

          {/* NO APPOINTMENTS IN SELECTED TAB */}

          {displayedAppointments.length === 0 ? (

            <p>
              {activeTab === "UPCOMING" &&
                "No upcoming appointments."}

              {activeTab === "COMPLETED" &&
                "No completed appointments."}

              {activeTab === "CANCELLED" &&
                "No cancelled appointments."}
            </p>

          ) : (

            displayedAppointments.map(
              (appointment) => (

                <div
                  key={appointment._id}
                  className="appointment-card"
                >

                  <h3>
                    Patient:{" "}
                    {appointment.patient?.name}
                  </h3>

                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {appointment.patient?.email}
                  </p>

                  <p>
                    <strong>
                      Date & Time:
                    </strong>{" "}
                    {new Date(
                      appointment.appointmentTime
                    ).toLocaleString()}
                  </p>

                  <p>
                    <strong>
                      Symptoms:
                    </strong>{" "}
                    {appointment.symptoms}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    <span
                      className={`status-badge ${appointment.status.toLowerCase()}`}
                    >
                      {appointment.status}
                    </span>
                  </p>

                  {/* ACTIONS */}

                  <div className="status-actions">

                    {/* BOOKED */}

                    {appointment.status ===
                      "BOOKED" && (
                      <>
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
                      </>
                    )}

                    {/* PRESCRIPTION */}

                    <button
                      className="prescription-btn"
                      onClick={() =>
                        navigate(
                          `/doctor/prescription/${appointment._id}`
                        )
                      }
                    >
                      Add Prescription
                    </button>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </main>

    </div>
  );
}

export default DoctorDashboard;