import express from 'express';
const router = express.Router();

// Dynamic import for ESM module
let OpenRouter;
(async () => {
  const module = await import("@openrouter/sdk");
  OpenRouter = module.OpenRouter;
})();

// AI Route
router.post("/symptom-check", async (req, res) => {
  setTimeout(() => {}, 10); // ensures OpenRouter is loaded

  const { symptom } = req.body;

  console.log("🟦 Incoming Symptom:", symptom);
  console.log("🔑 API Key Present:", !!process.env.OPENROUTER_API_KEY);

  if (!symptom) {
    return res.json({ reply: "Please describe your symptoms." });
  }

  try {
    const openRouter = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Void Health Assistant",
      },
    });

    const completion = await openRouter.chat.send({
      model: "tngtech/deepseek-r1t2-chimera:free",
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: "You are HealthAI Assistant, a friendly health chatbot.\n\nIMPORTANT RULES:\n- If the user says 'hi', 'hello', 'hey', or similar greetings → Respond with a warm greeting like 'Hello! I'm HealthAI Assistant. How can I help you today?'\n- If the user asks 'what are you', 'who are you', 'what can you do' → Introduce yourself: 'I'm HealthAI Assistant, an AI chatbot that can help analyze your health symptoms. Tell me what symptoms you're experiencing and I'll provide possible causes and advice.'\n- ONLY if the user describes actual physical symptoms (headache, fever, pain, nausea, cough, dizziness, etc.) → Provide medical analysis.\n- DO NOT analyze greetings, questions about your identity, or casual conversation as symptoms.\n- Be friendly and conversational.",
        },
        {
          role: "user",
          content: symptom,
        },
      ],
    });
    const reply =
      completion?.choices?.[0]?.message?.content ||
      "I couldn't analyze your symptoms.";

    res.json({ reply });
  } catch (err) {
    console.error("❌ OpenRouter Error:", err);
    res
      .status(500)
      .json({ reply: "AI service error. Please try again later." });
  }
});

export default router;
