import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function DoctorLeaves() {
  const navigate = useNavigate();

  const [leaveDates, setLeaveDates] = useState([]);
  const [leaveDate, setLeaveDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // FETCH LEAVE DATES
  // =========================

  const fetchLeaveDates = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/doctors/leave-dates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch leave dates"
        );
      }

      setLeaveDates(data.leaveDates || []);

    } catch (err) {
      console.error(err);
      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD
  // =========================

  useEffect(() => {
    fetchLeaveDates();
  }, []);

  // =========================
  // ADD LEAVE
  // =========================

  const handleAddLeave = async (e) => {
    e.preventDefault();

    if (!leaveDate) {
      setError("Please select a date.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const res = await fetch(
        `${API_URL}/doctors/leave-dates`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            date: leaveDate,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to add leave date"
        );
      }

      setMessage("Leave date added successfully.");
setLeaveDate("");
setLeaveDates(data.leaveDates || []);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // REMOVE LEAVE
  // =========================

  const handleRemoveLeave = async (date) => {
    try {
      setError("");
      setMessage("");

      const res = await fetch(
        `${API_URL}/doctors/leave-dates`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            date,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to remove leave date"
        );
      }

      setMessage("Leave date removed successfully.");

      fetchLeaveDates();

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="leave-page">
        <h2>Loading leave dates...</h2>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="leave-page">

      <button
        className="back-btn"
        onClick={() =>
          navigate("/doctor/dashboard")
        }
      >
        ← Back to Dashboard
      </button>

      <div className="leave-container">

        <h1>Manage Leave Dates</h1>

        <p>
          Add dates when you will not be available
          for appointments.
        </p>

        {/* MESSAGE */}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {/* ADD LEAVE */}

        <form
          className="leave-form"
          onSubmit={handleAddLeave}
        >

          <label>
            Select Leave Date
          </label>

          <input
            type="date"
            value={leaveDate}
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            onChange={(e) =>
              setLeaveDate(e.target.value)
            }
            required
          />

          <button type="submit">
            Add Leave
          </button>

        </form>

        {/* EXISTING LEAVES */}

        <div className="leave-list">

          <h2>
            Your Leave Dates
          </h2>

          {leaveDates.length === 0 ? (

            <p>
              No leave dates added.
            </p>

          ) : (

            leaveDates
              .sort(
                (a, b) =>
                  new Date(a) -
                  new Date(b)
              )
              .map((date) => (

                <div
                  className="leave-card"
                  key={date}
                >

                  <span>
                    {new Date(
                      `${date}T00:00:00`
                    ).toLocaleDateString()}
                  </span>

                  <button
                    className="remove-leave-btn"
                    onClick={() =>
                      handleRemoveLeave(date)
                    }
                  >
                    Remove
                  </button>

                </div>

              ))

          )}

        </div>

      </div>

    </div>
  );
}

export default DoctorLeaves;