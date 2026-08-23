const sendEmail = async ({ to, subject, html }) => {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
            sender: {
                name: "Healthcare Manager",
                email: process.env.BREVO_SENDER_EMAIL
            },
            to: [{ email: to }],
            subject,
            htmlContent: html
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            data.message || "Failed to send email via Brevo"
        );
    }

    return data;
};

module.exports = { sendEmail };