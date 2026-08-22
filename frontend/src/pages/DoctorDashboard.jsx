
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://healthcare-appointment-hn2g.onrender.com/api";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("UPCOMING");
  const [searchTerm, setSearchTerm] = useState("");

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

  const completedAppointments = appointments
    .filter(
      (appointment) =>
        appointment.status === "COMPLETED"
    )
    .sort(
      (a, b) =>
        new Date(b.appointmentTime) -
        new Date(a.appointmentTime)
    );

  const cancelledAppointments = appointments
    .filter(
      (appointment) =>
        appointment.status === "CANCELLED"
    )
    .sort(
      (a, b) =>
        new Date(b.appointmentTime) -
        new Date(a.appointmentTime)
    );

  // Dashboard shows only latest 10
  let displayedAppointments = [];

  if (activeTab === "UPCOMING") {
    displayedAppointments =
      upcomingAppointments;
  } else if (activeTab === "COMPLETED") {
    displayedAppointments =
      completedAppointments.slice(0, 10);
  } else if (activeTab === "CANCELLED") {
    displayedAppointments =
      cancelledAppointments.slice(0, 10);
  }

  // =========================
  // SEARCH FILTER
  // =========================

  const searchedAppointments =
    displayedAppointments.filter(
      (appointment) => {
        const patientName =
          appointment.patient?.name
            ?.toLowerCase() || "";

        const patientEmail =
          appointment.patient?.email
            ?.toLowerCase() || "";

        const symptoms =
          appointment.symptoms
            ?.toLowerCase() || "";

        const search =
          searchTerm.toLowerCase();

        return (
          patientName.includes(search) ||
          patientEmail.includes(search) ||
          symptoms.includes(search)
        );
      }
    );

  // =========================
  // FETCH APPOINTMENTS
  // =========================

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const doctorRes = await fetch(
        `${API_URL}/doctors/me`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
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

      const res = await fetch(
        `${API_URL}/appointments/doctor/${doctorData._id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

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

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to update status"
        );
      }

      fetchAppointments();

    } catch (error) {

      console.error(error);

      alert(error.message);

    }
  };

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  useEffect(() => {
    fetchAppointments();
  }, []);

  // =========================
  // TAB CHANGE
  // =========================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
  };

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

      <main className="dashboard-content">

        {/* WELCOME */}

        
<div className="welcome-section">

  <h2>
    Welcome, Dr. {user.name} 👨‍⚕️
  </h2>

  <p>
    Manage your patient appointments.
  </p>

  <button
    className="leave-btn"
    onClick={() =>
      navigate("/doctor/leaves")
    }
  >
    Manage Leave Dates
  </button>

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
              handleTabChange("UPCOMING")
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
              handleTabChange("COMPLETED")
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
              handleTabChange("CANCELLED")
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

          {/* SEARCH BAR */}

          <input
            className="appointment-search"
            type="text"
            placeholder="Search by patient name, email or symptoms..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          {/* NO APPOINTMENTS */}

          {searchedAppointments.length === 0 ? (

            <p>

              {searchTerm
                ? "No appointments found."
                : activeTab === "UPCOMING"
                  ? "No upcoming appointments."
                  : activeTab === "COMPLETED"
                    ? "No completed appointments."
                    : "No cancelled appointments."}

            </p>

          ) : (

            searchedAppointments.map(
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

                  {/* AI PRE-VISIT SUMMARY */}

                  {appointment.preVisitSummary && (

                    <div className="pre-visit-summary">

                      <h4>
                        AI Pre-Visit Summary
                      </h4>

                      <p>

                        <strong>
                          Urgency:
                        </strong>{" "}

                        <span
                          className={
                            `urgency-${appointment
                              .preVisitSummary
                              .urgency
                              ?.toLowerCase()}`
                          }
                        >

                          {
                            appointment
                              .preVisitSummary
                              .urgency
                          }

                        </span>

                      </p>

                      <p>

                        <strong>
                          Chief Complaint:
                        </strong>{" "}

                        {
                          appointment
                            .preVisitSummary
                            .chiefComplaint
                        }

                      </p>

                      {
                        appointment
                          .preVisitSummary
                          .suggestedQuestions
                          ?.length > 0 && (

                          <div>

                            <strong>
                              Suggested Questions:
                            </strong>

                            <ol>

                              {
                                appointment
                                  .preVisitSummary
                                  .suggestedQuestions
                                  .map(
                                    (
                                      question,
                                      index
                                    ) => (

                                      <li
                                        key={index}
                                      >
                                        {question}
                                      </li>

                                    )
                                  )
                              }

                            </ol>

                          </div>

                        )
                      }

                    </div>

                  )}

                  <p>

                    <strong>
                      Status:
                    </strong>{" "}

                    <span
                      className={
                        `status-badge ${appointment
                          .status
                          .toLowerCase()}`
                      }
                    >

                      {
                        appointment.status
                      }

                    </span>

                  </p>

                  {/* ACTIONS */}

                  <div className="status-actions">

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

          {/* VIEW ALL COMPLETED */}

          {activeTab === "COMPLETED" &&
            completedAppointments.length > 10 && (

              <div className="view-all-container">

                <button
                  className="view-all-btn"
                  onClick={() =>
                    navigate(
                      "/doctor/completed-appointments"
                    )
                  }
                >
                  View All Completed Appointments
                </button>

              </div>

            )}

          {/* VIEW ALL CANCELLED */}

          {activeTab === "CANCELLED" &&
            cancelledAppointments.length > 10 && (

              <div className="view-all-container">

                <button
                  className="view-all-btn"
                  onClick={() =>
                    navigate(
                      "/doctor/cancelled-appointments"
                    )
                  }
                >
                  View All Cancelled Appointments
                </button>

              </div>

            )}

        </div>

      </main>

    </div>
  );
}

export default DoctorDashboard;

