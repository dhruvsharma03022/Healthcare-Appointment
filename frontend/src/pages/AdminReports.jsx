import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://healthcare-appointment-hn2g.onrender.com/api";

function AdminReports() {

  const navigate = useNavigate();

  const [report, setReport] = useState(null);

  useEffect(() => {

    fetch(
      `${API_URL}/admin/reports`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )
      .then(res => res.json())
      .then(data => setReport(data));

  }, []);

  if (!report) {
    return <h2>Loading reports...</h2>;
  }

  return (
   <div className="reports-page">

  <h1>System Reports</h1>

  <div className="reports-grid">

    {/* All report cards only */}

    <div className="report-card">
      <h2>{report.totalDoctors}</h2>
      <p>Total Doctors</p>
    </div>

    <div className="report-card">
      <h2>{report.totalPatients}</h2>
      <p>Total Patients</p>
    </div>

    <div className="report-card">
      <h2>{report.totalAppointments}</h2>
      <p>Total Appointments</p>
    </div>

    <div className="report-card">
      <h2>{report.bookedAppointments}</h2>
      <p>Booked</p>
    </div>

    <div className="report-card">
      <h2>{report.completedAppointments}</h2>
      <p>Completed</p>
    </div>

    <div className="report-card">
      <h2>{report.cancelledAppointments}</h2>
      <p>Cancelled</p>
    </div>

    <div className="report-card">
      <h2>{report.totalPrescriptions}</h2>
      <p>Prescriptions</p>
    </div>

  </div>

  {/* OUTSIDE THE GRID */}

  <div className="doctor-performance">
    <h2>Doctor Performance</h2>

    {report.doctorPerformance?.map((doctor) => (
      <div
        key={doctor._id?._id || doctor._id}
        className="doctor-performance-card"
      >
        <span>
          {doctor._id?.name || "Unknown Doctor"}
        </span>

        <strong>
          {doctor.totalAppointments} appointments
        </strong>
      </div>
    ))}
  </div>

</div>
  );
}

export default AdminReports;