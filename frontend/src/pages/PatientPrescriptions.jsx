import { useEffect, useState } from "react";

const API_URL = "https://healthcare-appointment-hn2g.onrender.com/api";

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

            {/* DIAGNOSIS */}

            <h3>Diagnosis</h3>

            <p>
              {prescription.diagnosis}
            </p>


            {/* POST-VISIT SUMMARY */}

            {postVisitSummary ? (

              <div className="post-visit-summary">

                <h2>
                  Post-Visit Summary
                </h2>


                {/* CONSULTATION SUMMARY */}

                {postVisitSummary.summary && (

                  <div className="summary-section">

                    <h3>
                      Consultation Summary
                    </h3>

                    <p>
                      {postVisitSummary.summary}
                    </p>

                  </div>

                )}


                {/* MEDICATION SCHEDULE */}

                {Array.isArray(
                  postVisitSummary.medicationSchedule
                ) && (
                  <div className="summary-section">

                    <h3>
                      Medication Schedule
                    </h3>

                    <ul>

                      {postVisitSummary.medicationSchedule.map(
                        (item, index) => (

                          <li
                            key={item._id || index}
                          >

                            <strong>
                              {item.medicine}
                            </strong>

                            {" — "}

                            Dosage: {item.dosage}

                            {" | "}

                            Duration: {item.duration}

                          </li>

                        )
                      )}

                    </ul>

                  </div>
                )}


                {/* FOLLOW-UP STEPS */}

                {Array.isArray(
                  postVisitSummary.followUpSteps
                ) && (

                  <div className="summary-section">

                    <h3>
                      Follow-Up Steps
                    </h3>

                    <ul>

                      {postVisitSummary.followUpSteps.map(
                        (step, index) => (

                          <li key={index}>
                            {step}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )}

              </div>

            ) : (

              <div className="post-visit-summary">

                <h3>
                  Post-Visit Summary
                </h3>

                <p>
                  AI summary was not available
                  for this consultation.
                </p>

              </div>

            )}


            <hr />


            {/* MEDICINES */}

            <h3>Medicines</h3>

            {prescription.medicines?.map(
              (medicine, index) => (

                <div
                  className="medicine-card"
                  key={medicine._id || index}
                >

                  <p>

                    <strong>
                      Medicine:
                    </strong>

                    {" "}
                    {medicine.name}

                  </p>


                  <p>

                    <strong>
                      Dosage:
                    </strong>

                    {" "}
                    {medicine.dosage}

                  </p>


                  <p>

                    <strong>
                      Duration:
                    </strong>

                    {" "}
                    {medicine.duration}

                  </p>

                </div>

              )
            )}


            {/* INSTRUCTIONS */}

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