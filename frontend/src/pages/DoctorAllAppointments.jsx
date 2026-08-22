
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function DoctorAllAppointments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isCompleted =
    location.pathname.includes("completed");

  const status = isCompleted
    ? "COMPLETED"
    : "CANCELLED";

  const title = isCompleted
    ? "All Completed Appointments"
    : "All Cancelled Appointments";

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const searchText =
      search.toLowerCase().trim();

    const result = appointments.filter(
      (appointment) => {
        const patientName =
          appointment.patient?.name
            ?.toLowerCase() || "";

        const patientEmail =
          appointment.patient?.email
            ?.toLowerCase() || "";

        return (
          patientName.includes(searchText) ||
          patientEmail.includes(searchText)
        );
      }
    );

    setFilteredAppointments(result);

  }, [search, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      // Get doctor profile
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

      // Get doctor appointments
      const res = await fetch(
        `${API_URL}/appointments/doctor/${doctorData._id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
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

      const filtered = data
        .filter(
          (appointment) =>
            appointment.status === status
        )
        .sort(
          (a, b) =>
            new Date(b.appointmentTime) -
            new Date(a.appointmentTime)
        );

      setAppointments(filtered);

    } catch (error) {
      console.error(
        "Failed to fetch appointments:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>
          Loading appointments...
        </h2>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <main className="dashboard-content">

        <button
          className="back-btn"
          onClick={() =>
            navigate("/doctor/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        <div className="welcome-section">

          <h2>
            {title}
          </h2>

          <p>
            Search through all {status.toLowerCase()} appointments.
          </p>

        </div>

        <div className="appointment-search">

          <input
            type="text"
            placeholder="Search by patient name or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="dashboard-card">

          {filteredAppointments.length === 0 ? (

            <p>
              No appointments found.
            </p>

          ) : (

            filteredAppointments.map(
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
                    <strong>Email:</strong>{" "}
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

                </div>

              )
            )

          )}

        </div>

      </main>

    </div>
  );
}

export default DoctorAllAppointments;

