import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Doctors() {
    const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/doctors"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch doctors"
          );
        }

        setDoctors(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="doctors-page">
        <h2>Loading doctors...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctors-page">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="doctors-page">
      <div className="doctors-header">
        <h1>Find a Doctor 👨‍⚕️</h1>
        <p>Choose a doctor for your appointment.</p>
      </div>

      {doctors.length === 0 ? (
        <p className="no-doctors">
          No doctors available.
        </p>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <div
              className="doctor-card"
              key={doctor._id}
            >
              <h2>{doctor.name}</h2>

              <p>
                <strong>Specialization:</strong>
                <br />
                {doctor.specialization}
              </p>

              <p>
                <strong>Working Hours:</strong>
                <br />
                {doctor.workingHours.start} -{" "}
                {doctor.workingHours.end}
              </p>

              <p>
                <strong>Appointment Duration:</strong>
                <br />
                {doctor.slotDuration} minutes
              </p>

              <button
  onClick={() =>
    navigate("/book-appointment")
  }
>
  Book Appointment
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Doctors;