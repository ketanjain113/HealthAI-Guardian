import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.post("/symptom-check", async (req, res) => {
  const { symptom, message, text } = req.body;
  const input = symptom || message || text || "";

  if (!input.trim()) {
    return res.json({ reply: "Please type your message 😊" });
  }

  // Quick responses for greetings
  const lower = input.trim().toLowerCase();
  if (/^(hi|hello|hey)$/.test(lower)) {
    return res.json({ reply: "Hello! I'm HealthAI Assistant 😊 How can I help you today?" });
  }
  if (/what (are|can) you/.test(lower)) {
    return res.json({ reply: "I'm HealthAI Assistant. Tell me your symptoms and I'll help analyze them!" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ reply: "AI service not configured." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 2048
      }
    });
    
    const prompt = `You are a health assistant. User says: "${input}". Provide a brief, helpful response (max 150 words).`;
    
    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    return res.json({ reply });
  } catch (err) {
    console.error("Gemini Error:", err.message);
    return res.status(500).json({ reply: "Sorry, I'm having trouble right now. Please try again." });
  }
});

export default router;
