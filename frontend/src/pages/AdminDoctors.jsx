import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
const [loading, setLoading] = useState(true);

const [showForm, setShowForm] = useState(false);
const [editingDoctorId, setEditingDoctorId] = useState(null);
const [formData, setFormData] = useState({
  name: "",
  email: "",
  specialization: "",
  start: "09:00",
  end: "17:00",
  slotDuration: 30,
});

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load doctors"
        );
      }

      setDoctors(data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
const handleEditDoctor = (doctor) => {
  setEditingDoctorId(doctor._id);

  setFormData({
    name: doctor.name || "",
    email: doctor.email || "",
    specialization: doctor.specialization || "",
    start: doctor.workingHours?.start || "09:00",
    end: doctor.workingHours?.end || "17:00",
    slotDuration: doctor.slotDuration || 30,
  });

  setShowForm(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
const handleCancelEdit = () => {
  setEditingDoctorId(null);

  setFormData({
    name: "",
    email: "",
    specialization: "",
    start: "09:00",
    end: "17:00",
    slotDuration: 30,
  });

  setShowForm(false);
};
const handleAddDoctor = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    const url = editingDoctorId
      ? `${API_URL}/doctors/${editingDoctorId}`
      : `${API_URL}/doctors`;

    const method = editingDoctorId
      ? "PUT"
      : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        specialization: formData.specialization,
        workingHours: {
          start: formData.start,
          end: formData.end,
        },
        slotDuration: Number(formData.slotDuration),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message ||
          `Failed to ${
            editingDoctorId ? "update" : "add"
          } doctor`
      );
    }

    alert(
      editingDoctorId
        ? "Doctor updated successfully!"
        : "Doctor added successfully!"
    );

    setFormData({
      name: "",
      email: "",
      specialization: "",
      start: "09:00",
      end: "17:00",
      slotDuration: 30,
    });

    setEditingDoctorId(null);
    setShowForm(false);

    fetchDoctors();

  } catch (error) {
    console.error("Doctor save error:", error);
    alert(error.message);
  }
};

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (doctorId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/doctors/${doctorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to delete doctor"
        );
      }

      alert("Doctor deleted successfully");

      fetchDoctors();

    } catch (error) {
      console.error("Delete doctor error:", error);
      alert(error.message);
    }
  };

  if (loading) {
    return <h2>Loading doctors...</h2>;
  }

  return (
    <div className="doctors-page">

      <div className="doctors-header">
        <h1>Manage Doctors</h1>
        <p>
          View and manage registered doctors.
        </p>

        <button
  className="add-doctor-btn"
  onClick={() => setShowForm(!showForm)}
>
  {showForm ? "Close Form" : "Add Doctor"}
</button>
      </div>
      {showForm && (
  <form
    className="doctor-form"
    onSubmit={handleAddDoctor}
  >
    <h2>
  {editingDoctorId
    ? "Edit Doctor"
    : "Add New Doctor"}
</h2>

    <input
      type="text"
      name="name"
      placeholder="Doctor Name"
      value={formData.name}
      onChange={handleChange}
      required
    />

    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="specialization"
      placeholder="Specialization"
      value={formData.specialization}
      onChange={handleChange}
      required
    />

    <label>Working Hours Start</label>

    <input
      type="time"
      name="start"
      value={formData.start}
      onChange={handleChange}
      required
    />

    <label>Working Hours End</label>

    <input
      type="time"
      name="end"
      value={formData.end}
      onChange={handleChange}
      required
    />

    <label>Slot Duration (minutes)</label>

    <input
      type="number"
      name="slotDuration"
      value={formData.slotDuration}
      onChange={handleChange}
      min="5"
      required
    />
    {editingDoctorId && (
  <button
    type="button"
    className="cancel-edit-btn"
    onClick={handleCancelEdit}
  >
    Cancel
  </button>
)}
    <button type="submit">
  {editingDoctorId
    ? "Update Doctor"
    : "Create Doctor"}
</button>
  </form>
)}

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
                Dr. {doctor.name}
              </h2>

              <p>
                <strong>Specialization:</strong>{" "}
                {doctor.specialization}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {doctor.email}
              </p>

              <p>
                <strong>Working Hours:</strong>{" "}
                {doctor.workingHours?.start} -{" "}
                {doctor.workingHours?.end}
              </p>

              <p>
                <strong>Slot Duration:</strong>{" "}
                {doctor.slotDuration} minutes
              </p>

              <div className="doctor-actions">

                <button
  className="edit-doctor-btn"
  onClick={() => handleEditDoctor(doctor)}
>
  Edit
</button>

                <button
                  className="delete-doctor-btn"
                  onClick={() =>
                    handleDelete(doctor._id)
                  }
                >
                  Delete
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default AdminDoctors;