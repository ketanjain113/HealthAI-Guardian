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
          content: "You are HealthAI Assistant, a friendly health chatbot. Have natural conversations with users. ONLY provide medical symptom analysis if the user explicitly describes health symptoms (like 'I have a headache', 'my throat hurts', 'I feel dizzy'). For general questions ('what are you', 'who are you', 'what can you do'), introduce yourself and explain your capabilities. For greetings ('hi', 'hello'), greet back warmly. Be conversational and helpful, not robotic.",
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
