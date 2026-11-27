require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');

function readJSON(filename) {
    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

// ─── Gemini AI Constituency Insight ────────────────────────────
async function generateConstituencyInsight(query) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const data = readJSON('constituency-data.json');
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are a helpful Community Assistant for the ${data.constituency} constituency in Bengaluru.
Based on the following constituency data, answer the user query: "${query || 'Provide a general update'}"

Constituency Data:
${JSON.stringify(data, null, 2)}

STRICT OUTPUT FORMAT:
Provide the output in JSON format with these keys:
1. "answer_en": "Detailed answer in English",
2. "answer_kn": "Detailed answer in Kannada (ಕನ್ನಡ)",
3. "whatsappMessage": "A professional WhatsApp message with emojis, the answer in both English and Kannada, and relevant helpline numbers if applicable."

Ensure the tone is helpful and informative.
Return ONLY the JSON. No markdown.`;

    try {
        console.log('📡 Calling Gemini AI (gemini-3.5-flash) for Constituency Insight...');
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
        });

        console.log('✅ Received response from Gemini');
        // Extract text using the correct pattern provided by user
        let text = response.text;
        
        if (!text) {
            console.error('❌ No text in Gemini response');
            throw new Error('Empty response from AI');
        }
        
        // Clean up the response if it contains markdown code blocks
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error('❌ Gemini AI error details:', error);
        throw error;
    }
}

// ─── WhatsApp Delivery (TextMeBot) ──────────────────────────────
async function sendWhatsApp(message) {
    const recipient = process.env.WHATSAPP_PHONE;
    const apikey = process.env.TEXTMEBOT_API_KEY;
    if (!recipient || !apikey) return { sent: false, detail: 'not configured' };

    const url = `http://api.textmebot.com/send.php?recipient=${encodeURIComponent(recipient)}` +
        `&apikey=${encodeURIComponent(apikey)}` +
        `&text=${encodeURIComponent(message || '')}&json=yes`;

    try {
        const r = await fetch(url);
        const body = await r.text();
        console.log('📲 TextMeBot response:', body);
        let ok = r.ok;
        try {
            const parsed = JSON.parse(body);
            if (parsed.status) ok = parsed.status === 'success';
        } catch { /* non-JSON response */ }
        return { sent: ok, detail: body };
    } catch (err) {
        console.error('⚠️ TextMeBot failed:', err.message);
        return { sent: false, detail: err.message };
    }
}

// ─── API Endpoints ──────────────────────────────────────────────
app.post('/api/ask', async (req, res) => {
    try {
        const { query } = req.body;
        console.log(`🏛️ Processing query for RR Nagar: "${query}"`);
        
        const insight = await generateConstituencyInsight(query);

        // Deliver the bilingual answer to WhatsApp via TextMeBot
        const whatsapp = await sendWhatsApp(insight.whatsappMessage);

        res.json({ success: true, data: insight, whatsapp });
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/status', (req, res) => {
    res.json({ status: 'Constituency Agent is active', port: PORT });
});

app.listen(PORT, () => {
    console.log(`🏛️ Know Your Constituency Agent service running on http://localhost:${PORT}`);
});
