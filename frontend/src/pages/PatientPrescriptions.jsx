import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/prescriptions/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      console.log(
        "PRESCRIPTIONS FROM API:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to fetch prescriptions"
        );
      }

      setPrescriptions(data);

    } catch (error) {
      console.error(
        "Failed to fetch prescriptions:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Safely display strings or objects
  const displayItem = (item) => {
    if (typeof item === "string") {
      return item;
    }

    if (typeof item === "object" && item !== null) {
      return Object.values(item).join(" - ");
    }

    return String(item);
  };

  if (loading) {
    return (
      <div className="prescriptions-page">
        <h2>Loading prescriptions...</h2>
      </div>
    );
  }

  return (
    <div className="prescriptions-page">

      <h1>My Prescriptions</h1>

      {prescriptions.length === 0 ? (

        <p>No prescriptions available.</p>

      ) : (

        prescriptions.map((prescription) => {

          const postVisitSummary =
            prescription.appointment?.postVisitSummary;

          return (

            <div
              className="prescription-card"
              key={prescription._id}
            >

              <h2>Prescription</h2>

              <p>
                <strong>Doctor:</strong>{" "}
                Dr. {prescription.doctor?.name}
              </p>

              <p>
                <strong>Specialization:</strong>{" "}
                {prescription.doctor?.specialization}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  prescription.createdAt
                ).toLocaleDateString()}
              </p>

              <hr />

              <h3>Diagnosis</h3>

              <p>
                {prescription.diagnosis}
              </p>

              {/* POST VISIT SUMMARY */}

             {postVisitSummary ? (

  <div className="post-visit-summary">

    <hr />

    <h3>Post-Visit Summary</h3>

    {postVisitSummary.summary && (
      <p>
        {postVisitSummary.summary}
      </p>
    )}

    {Array.isArray(
      postVisitSummary.medicationSchedule
    ) && (
      <>
        <h3>Medication Schedule</h3>

        <ul>
          {postVisitSummary.medicationSchedule.map(
            (item, index) => (
              <li key={index}>
                {displayItem(item)}
              </li>
            )
          )}
        </ul>
      </>
    )}

    {Array.isArray(
      postVisitSummary.followUpSteps
    ) && (
      <>
        <h3>Follow-Up Steps</h3>

        <ul>
          {postVisitSummary.followUpSteps.map(
            (step, index) => (
              <li key={index}>
                {displayItem(step)}
              </li>
            )
          )}
        </ul>
      </>
    )}

  </div>

) : (

  <div className="post-visit-summary">

    <hr />

    <h3>Post-Visit Summary</h3>

    <p>
      AI summary was not available for this consultation.
    </p>

  </div>

)}

              <hr />

              <h3>Medicines</h3>

              {prescription.medicines?.map(
                (medicine, index) => (

                  <div
                    className="medicine-card"
                    key={index}
                  >

                    <p>
                      <strong>Medicine:</strong>{" "}
                      {medicine.name}
                    </p>

                    <p>
                      <strong>Dosage:</strong>{" "}
                      {medicine.dosage}
                    </p>

                    <p>
                      <strong>Duration:</strong>{" "}
                      {medicine.duration}
                    </p>

                  </div>

                )
              )}

              {prescription.instructions && (
                <>

                  <h3>
                    Instructions
                  </h3>

                  <p>
                    {prescription.instructions}
                  </p>

                </>
              )}

            </div>

          );
        })

      )}

    </div>
  );
}

export default PatientPrescriptions;