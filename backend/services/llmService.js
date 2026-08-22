const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
exports.generatePreVisitSummary = async (symptoms) => {

    const prompt = `
Analyse the patient's symptoms and create a pre-visit summary
for the doctor.

Symptoms:
${symptoms}

Return:

1. Urgency level (Low / Medium / High)
2. Chief complaint
3. Exactly three suggested questions that the DOCTOR should ask
   the PATIENT to gather more information about the symptoms.

Important:
- The suggested questions must be written from the doctor's perspective.
- Each suggested question should be directed to the patient.
- Do NOT write questions that the patient should ask the doctor.
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

    try {
        // Try Gemini first
        const response =
            await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt
            });

        const text = response.text;

        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleanText);

    } catch (geminiError) {

        console.error(
            "Gemini pre-visit failed, trying Groq:",
            geminiError.message
        );

        try {
            // Fallback to Groq
            const completion =
                await groq.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    model: "openai/gpt-oss-20b",

                    temperature: 0.3
                });

            const text =
                completion.choices[0]
                    ?.message
                    ?.content;

            if (!text) {
                throw new Error(
                    "Empty response from Groq"
                );
            }

            const cleanText = text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            return JSON.parse(cleanText);

        } catch (groqError) {

            console.error(
                "Groq pre-visit error:",
                groqError
            );

            throw new Error(
                "Failed to generate pre-visit summary"
            );
        }
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
        const prompt = `
Create a patient-friendly post-visit summary based only on
the consultation information below and make it of atleast 100 words.

Clinical Notes:
${clinicalNotes}

Diagnosis:
${diagnosis}

Medicines:
${JSON.stringify(medicines)}

Instructions:
${instructions}

Important:
- Do not add information that was not provided.
- Do not make new diagnoses.
- Keep the language simple and patient-friendly.
- Do not provide emergency instructions.
- Return ONLY valid JSON.

Required format:

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
`;

        const completion =
            await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "openai/gpt-oss-20b",
                temperature: 0.3
            });

        const text =
            completion.choices[0]?.message?.content;

        if (!text) {
            throw new Error(
                "Empty response from Groq"
            );
        }

        const cleanText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleanText);

    } catch (error) {

        console.error(
            "Groq post-visit error:",
            error
        );

        throw new Error(
            "Failed to generate post-visit summary"
        );
    }
};