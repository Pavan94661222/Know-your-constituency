# 🏛️ Know Your Constituency

A service that provides community insights and answers for residents of **Rajarajeshwarinagar (RR Nagar)**, Bengaluru — shown in English + Kannada on screen and delivered to WhatsApp.

## How it works
1. **Ask**: The web UI (or any HTTP client) sends a question to `POST /api/ask`.
2. **AI Insight**: The agent reads local constituency data and asks Gemini for a bilingual answer.
3. **WhatsApp Delivery**: The formatted `whatsappMessage` is sent to your phone via **TextMeBot**.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment** (copy `.env.example` to `.env`):
   ```
   GEMINI_API_KEY=...
   WHATSAPP_PHONE=+91XXXXXXXXXX
   TEXTMEBOT_API_KEY=...
   PORT=3006
   ```

3. **Run the Service**:
   ```bash
   node server.js
   ```
   Open http://localhost:3006

## API
- `POST /api/ask` — body `{ "query": "..." }` → `{ success, data: { answer_en, answer_kn, whatsappMessage }, whatsapp: { sent, detail } }`
- `GET /status` — health check.

## Deployment
- **Frontend**: static `public/` on Netlify (see `netlify.toml`). Set the Render URL in `public/config.js`.
- **Backend**: Render web service (see `render.yaml`).

## Project Structure
- `server.js`: Express API + Gemini insight + TextMeBot delivery.
- `public/`: web UI.
- `data/`: local constituency database.
- `n8n/`: legacy workflow, superseded by direct TextMeBot delivery.
