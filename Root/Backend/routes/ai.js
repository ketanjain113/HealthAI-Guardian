import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

let genAI;
let model;

// Initialize Gemini
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 200,
    },
  });
}

router.post("/symptom-check", async (req, res) => {
  const { symptom, message, text } = req.body;
  const rawInput =
    (typeof symptom === "string" && symptom) ||
    (typeof message === "string" && message) ||
    (typeof text === "string" && text) ||
    "";

  if (!rawInput || typeof rawInput !== "string") {
    return res.json({ reply: "Please type your message 😊" });
  }

  // ✅ Clean input properly
  const cleaned = rawInput
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ""); // removes emojis/punctuation

  // ✅ SUPER STRONG GREETING BLOCK
  if (/^(hi|hello|hey|hii+|hiii+|yo|sup|good\s(morning|afternoon|evening))\b/.test(cleaned)) {
    return res.json({
      reply: "Hello! I'm HealthAI Assistant 😊 How can I help you today?",
    });
  }

  // ✅ Identity block
  if (/\b(who are you|what are you|what can you do|what do you do)\b/.test(cleaned)) {
    return res.json({
      reply:
        "I'm HealthAI Assistant — I can help you understand symptoms, suggest possible causes, and give general health advice. Tell me what you're experiencing 😊",
    });
  }

  // ✅ Ensure Gemini ready
  if (!model) {
    return res.status(500).json({
      reply: "AI service is not configured. Please add GEMINI_API_KEY.",
    });
  }

  try {
    const systemPrompt = `You are HealthAI Assistant.

IMPORTANT:
- If the user is greeting, respond with a greeting.
- ONLY analyze symptoms when the user describes real health symptoms.
- If not symptoms, respond normally like a friendly chatbot.
Never analyze greetings as symptoms.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${rawInput}\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const reply = response.text()?.trim() || "I couldn't process that. Please try again.";

    return res.json({ reply });
  } catch (err) {
    console.error("❌ Gemini Error:", err);
    return res.status(500).json({
      reply: "AI service error. Please try again later.",
    });
  }
});

export default router;
