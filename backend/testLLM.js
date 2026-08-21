require("dotenv").config();

const {
    generatePreVisitSummary
} = require("./services/llmService");

async function test() {
    try {
        const result =
            await generatePreVisitSummary(
                "I have been having a mild headache and fever since yesterday."
            );

        console.log(
            "PRE-VISIT SUMMARY:"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );

    } catch (error) {
        console.error(
            "TEST ERROR:",
            error.message
        );
    }
}

test();