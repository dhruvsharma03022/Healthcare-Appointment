import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const fetchDoctors = async (
    searchName = "",
    searchSpecialization = ""
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchName.trim()) {
        params.append(
          "name",
          searchName.trim()
        );
      }

      if (searchSpecialization.trim()) {
        params.append(
          "specialization",
          searchSpecialization.trim()
        );
      }

      const url =
        params.toString()
          ? `https://healthcare-appointment-hn2g.onrender.com/api/doctors?${params.toString()}`
          : "https://healthcare-appointment-hn2g.onrender.com/api/doctors";

      const response = await fetch(url);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch doctors"
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

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    fetchDoctors(
      name,
      specialization
    );
  };

  const handleClear = () => {
    setName("");
    setSpecialization("");

    fetchDoctors();
  };

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

        <p>
          Search for a doctor by name
          or specialization.
        </p>

      </div>

      {/* SEARCH */}

      <form
        className="doctor-search"
        onSubmit={handleSearch}
      >

        <input
          type="text"
          placeholder="Search by doctor name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Search by specialization"
          value={specialization}
          onChange={(e) =>
            setSpecialization(
              e.target.value
            )
          }
        />

        <button type="submit">
          Search
        </button>

        <button
          type="button"
          onClick={handleClear}
        >
          Clear
        </button>

      </form>

      {/* DOCTORS */}

      {doctors.length === 0 ? (
        <p className="no-doctors">
          No doctors found.
        </p>
      ) : (
        <div className="doctors-grid">

          {doctors.map((doctor) => (

            <div
              className="doctor-card"
              key={doctor._id}
            >

              <h2>
                {doctor.name}
              </h2>

              <p>
                <strong>
                  Specialization:
                </strong>
                <br />

                {doctor.specialization}
              </p>

              <p>
                <strong>
                  Working Hours:
                </strong>
                <br />

                {doctor.workingHours.start}
                {" - "}
                {doctor.workingHours.end}
              </p>

              <p>
                <strong>
                  Appointment Duration:
                </strong>
                <br />

                {doctor.slotDuration}
                {" minutes"}
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/book-appointment"
                  )
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