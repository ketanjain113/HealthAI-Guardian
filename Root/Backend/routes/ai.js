import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

let genAI;
let model;

// Initialize Gemini
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    console.log("✅ Gemini initialized successfully");
  } catch (error) {
    console.error("❌ Gemini initialization failed:", error.message);
  }
} else {
  console.warn("⚠️ GEMINI_API_KEY not found in environment variables");
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
    const systemPrompt = `You are HealthAI Assistant. When users describe health symptoms, analyze them and provide possible causes. For greetings or general questions, respond naturally.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${rawInput}\nAssistant:`;

    console.log("🔵 Sending to Gemini:", rawInput.substring(0, 50));
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });
    
    console.log("🟢 Gemini response received");
    
    const response = result.response;
    const reply = response.text()?.trim() || "I couldn't process that. Please try again.";

    console.log("✅ Reply:", reply.substring(0, 100));
    
    return res.json({ reply });
  } catch (err) {
    console.error("❌ Gemini Error Full Details:", {
      message: err.message,
      status: err.status,
      statusText: err.statusText,
      errorDetails: err.errorDetails,
      stack: err.stack?.substring(0, 500)
    });
    
    const errorMsg = err.message || "Unknown error";
    return res.status(500).json({
      reply: `AI service error: ${errorMsg}. Please check your API key.`,
    });
  }
});

export default router;
