import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "https://healthcare-appointment-hn2g.onrender.com/api";

function CreatePrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
const [clinicalNotes, setClinicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("");

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      duration: ""
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handleMedicineChange = (
    index,
    field,
    value
  ) => {
    const updatedMedicines = [...medicines];

    updatedMedicines[index][field] = value;

    setMedicines(updatedMedicines);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        duration: ""
      }
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) {
      return;
    }

    setMedicines(
      medicines.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/prescriptions`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
  appointmentId,
  diagnosis,
  clinicalNotes,
  medicines,
  instructions
})
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to create prescription"
        );
      }

      alert(
        "Prescription created successfully"
      );

      navigate("/doctor");

    } catch (error) {
      console.error(error);

      alert(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-page">

      <h1>Create Prescription</h1>

      <form onSubmit={handleSubmit}>

        <div className="form-group">

          <label>Diagnosis</label>

          <textarea
            value={diagnosis}
            onChange={(e) =>
              setDiagnosis(e.target.value)
            }
            required
          />

        </div>
            <div className="form-group">

  <label>Clinical Notes</label>

  <textarea
    placeholder="Enter post-visit clinical notes"
    value={clinicalNotes}
    onChange={(e) =>
      setClinicalNotes(e.target.value)
    }
    rows="5"
    required
  />

</div>

        <h3>Medicines</h3>

        {medicines.map(
          (medicine, index) => (

            <div
              key={index}
              className="medicine-form"
            >

              <input
                type="text"
                placeholder="Medicine name"
                value={medicine.name}
                onChange={(e) =>
                  handleMedicineChange(
                    index,
                    "name",
                    e.target.value
                  )
                }
                required
              />


              <input
                type="text"
                placeholder="Dosage"
                value={medicine.dosage}
                onChange={(e) =>
                  handleMedicineChange(
                    index,
                    "dosage",
                    e.target.value
                  )
                }
                required
              />


              <input
                type="text"
                placeholder="Duration"
                value={medicine.duration}
                onChange={(e) =>
                  handleMedicineChange(
                    index,
                    "duration",
                    e.target.value
                  )
                }
                required
              />


              {medicines.length > 1 && (

                <button
                  type="button"
                  onClick={() =>
                    removeMedicine(index)
                  }
                >
                  Remove
                </button>

              )}

            </div>

          )
        )}


        <button
          type="button"
          onClick={addMedicine}
        >
          + Add Medicine
        </button>


        <div className="form-group">

          <label>Instructions</label>

          <textarea
            value={instructions}
            onChange={(e) =>
              setInstructions(
                e.target.value
              )
            }
          />

        </div>


        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "Save Prescription"}
        </button>

      </form>

    </div>
  );
}

export default CreatePrescription;