import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = "https://healthcare-appointment-hn2g.onrender.com/api";

function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load patients"
        );
      }

      setPatients(data);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredPatients = patients.filter((patient) =>
  patient.name.toLowerCase().includes(search.toLowerCase()) ||
  patient.email.toLowerCase().includes(search.toLowerCase())
);

  if (loading) {
    return <h2>Loading patients...</h2>;
  }

  return (
    <div className="appointments-page">
      <h1>Manage Patients</h1>
      <input
  type="text"
  placeholder="Search by name or email..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="patient-search"
/>

      {filteredPatients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        filteredPatients.map((patient) => (
          <div
            key={patient._id}
            className="appointment-card"
          >
            <h3>{patient.name}</h3>

            <p>
              <strong>Email:</strong>{" "}
              {patient.email}
            </p>

            <p>
              <strong>Role:</strong>{" "}
              {patient.role}
            </p>
            <button
  onClick={() =>
    navigate(`/admin/patients/${patient._id}/appointments`)
  }
>
  View Appointments
</button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminPatients;