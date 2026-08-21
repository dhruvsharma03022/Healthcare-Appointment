const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

exports.generatePreVisitSummary = async (symptoms) => {
    try {
        const prompt = `
Analyse these symptoms and return:

1. Urgency level (Low / Medium / High)
2. Chief complaint
3. Three suggested questions for the doctor

Symptoms:
${symptoms}

Important:
- This is a pre-visit summary for a doctor.
- Do not make a definitive diagnosis.
- The urgency level is only an AI-generated aid.
- Do not provide emergency instructions.
- Return ONLY valid JSON.

Required format:

{
    "urgency": "Low",
    "chiefComplaint": "...",
    "suggestedQuestions": [
        "...",
        "...",
        "..."
    ]
}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        const text = response.text;

        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error(
            "Gemini pre-visit error:",
            error
        );

        throw new Error(
            "Failed to generate pre-visit summary"
        );
    }
};


// =====================================
// POST-VISIT SUMMARY
// =====================================

exports.generatePostVisitSummary = async ({
    clinicalNotes,
    diagnosis,
    medicines,
    instructions
}) => {
    try {

        const medicineText = medicines
            .map(
                (medicine) =>
                    `Medicine: ${medicine.name}
Dosage: ${medicine.dosage}
Duration: ${medicine.duration}`
            )
            .join("\n\n");

        const prompt = `
Convert the following doctor's post-visit information
into a clear, simple, patient-friendly summary.

Clinical Notes:
${clinicalNotes}

Diagnosis:
${diagnosis}

Medicines:
${medicineText}

Instructions:
${instructions || "None provided"}

Return ONLY valid JSON in this exact format:

{
    "summary": "...",
    "medicationSchedule": [
        {
            "medicine": "...",
            "dosage": "...",
            "duration": "..."
        }
    ],
    "followUpSteps": [
        "...",
        "..."
    ]
}

Important:
- Use simple language that a patient can easily understand.
- Do not add information that is not present in the doctor's notes.
- Do not change the prescribed dosage.
- Do not invent medicines.
- Do not make additional diagnoses.
- Keep the doctor's instructions accurate.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        const text = response.text;

        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleanText);

    } catch (error) {

        console.error(
            "Gemini post-visit error:",
            error
        );

        throw new Error(
            "Failed to generate post-visit summary"
        );
    }
};