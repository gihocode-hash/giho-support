
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // For some reason listModels might not be directly on genAI, let's check
    // Actually it is not. It's on the ModelManager or similar?
    // Wait, in v0.24.1, it might be different.
    // Let's try to just use a known working model: gemini-pro is usually standard.
    // But since it failed, let's try to see if we can find the correct one.

    // Actually, there is no easy listModels in the client SDK for Node.js in some versions?
    // Let's try to use the REST API manually to list models if SDK fails.

    console.log("Trying gemini-2.0-flash-exp...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-2.0-flash-exp");
    } catch (e) {
        console.log("Failed gemini-2.0-flash-exp: " + e.message);
    }

    console.log("Trying gemini-1.5-pro...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-pro");
    } catch (e) {
        console.log("Failed gemini-1.5-pro: " + e.message);
    }
}

main();
