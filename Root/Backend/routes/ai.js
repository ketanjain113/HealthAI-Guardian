import express from "express";
const router = express.Router();

// ✅ Load OpenRouter SDK safely (ESM dynamic import)
let OpenRouter;
(async () => {
  try {
    const module = await import("@openrouter/sdk");
    OpenRouter = module.OpenRouter;
    console.log("✅ OpenRouter SDK loaded");
  } catch (err) {
    console.error("❌ Failed to load OpenRouter SDK:", err);
  }
})();

// ✅ AI Route
router.post("/symptom-check", async (req, res) => {
  const { symptom } = req.body;

  console.log("🟦 Incoming Message:", symptom);
  console.log("🔑 API Key Present:", !!process.env.OPENROUTER_API_KEY);

  // ✅ Validation
  if (!symptom || !symptom.trim()) {
    return res.json({ reply: "Please describe your symptoms or ask a question 😊" });
  }

  // ✅ Pre-processing: handle greetings / identity locally (most reliable)
  const cleaned = symptom.trim().toLowerCase();

  const greetings = ["hi", "hello", "hey", "hii", "hiii", "yo", "hola"];
  if (greetings.includes(cleaned)) {
    return res.json({
      reply: "Hello! I'm HealthAI Assistant 😊 How can I help you today?",
    });
  }

  const identityQuestions = [
    "who are you",
    "what are you",
    "what can you do",
    "what do you do",
  ];
  if (identityQuestions.some((q) => cleaned.includes(q))) {
    return res.json({
      reply:
        "I'm HealthAI Assistant — I can help you understand symptoms, suggest possible causes, and give general health advice. Tell me what you're experiencing 😊",
    });
  }

  // ✅ Ensure OpenRouter is ready
  if (!OpenRouter) {
    return res.status(503).json({
      reply: "AI service is still loading. Please try again in a moment.",
    });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      reply: "Server error: Missing OpenRouter API Key.",
    });
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
          content: `
You are HealthAI Assistant, a friendly and calm health chatbot.

Rules:
- If the user greets ("hi", "hello", "hey"), greet them normally.
- If the user asks who you are / what you do, introduce yourself.
- ONLY analyze symptoms when the user describes actual health symptoms.
- If the user is chatting casually, respond casually.

When analyzing symptoms:
- Ask 2–4 short follow-up questions (age, duration, severity, triggers).
- Suggest common possible causes (not just worst-case).
- Give safe home-care tips for mild cases.
- Mention warning signs for urgent medical attention.

Emergency:
If the user mentions chest pain, trouble breathing, fainting, stroke symptoms, seizures,
severe bleeding, or self-harm thoughts → advise emergency help immediately.

Keep answers simple, friendly, and clear.
`,
        },
        {
          role: "user",
          content: `User said: "${symptom}"`,
        },
      ],
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "I couldn't process that. Please try again with more details.";

    return res.json({ reply });
  } catch (err) {
    console.error("❌ OpenRouter Error:", err);
    return res.status(500).json({
      reply: "AI service error. Please try again later.",
    });
  }
});

export default router;
