const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Using API Key:', apiKey.substring(0, 10) + '...');
    const ai = new GoogleGenAI({ apiKey });

    try {
        console.log('Calling gemini-3.5-flash...');
        const result = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: "Hi, this is a test. Reply with 'OK'."
        });
        console.log('Result:', result.text);
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
