import express from "express";
const router = express.Router();

let OpenRouter;
(async () => {
  const module = await import("@openrouter/sdk");
  OpenRouter = module.OpenRouter;
})();

router.post("/symptom-check", async (req, res) => {
  const { symptom } = req.body;

  if (!symptom || typeof symptom !== "string") {
    return res.json({ reply: "Please type your message 😊" });
  }

  // ✅ Clean input properly
  const cleaned = symptom
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ""); // removes emojis/punctuation

  // ✅ SUPER STRONG GREETING BLOCK
  if (
    cleaned === "hi" ||
    cleaned === "hello" ||
    cleaned === "hey" ||
    cleaned === "hii" ||
    cleaned === "hiii"
  ) {
    return res.json({
      reply: "Hello! I'm HealthAI Assistant 😊 How can I help you today?",
    });
  }

  // ✅ Identity block
  if (
    cleaned.includes("who are you") ||
    cleaned.includes("what are you") ||
    cleaned.includes("what can you do") ||
    cleaned.includes("what do you do")
  ) {
    return res.json({
      reply:
        "I'm HealthAI Assistant — I can help you understand symptoms, suggest possible causes, and give general health advice. Tell me what you're experiencing 😊",
    });
  }

  // ✅ Ensure OpenRouter ready
  if (!OpenRouter) {
    return res.json({ reply: "AI is loading, please try again in 2 seconds..." });
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
You are HealthAI Assistant.

IMPORTANT:
- If the user is greeting, respond with a greeting.
- ONLY analyze symptoms when the user describes real health symptoms.
- If not symptoms, respond normally like a friendly chatbot.
Never analyze greetings as symptoms.
`,
        },
        {
          role: "user",
          content: symptom,
        },
      ],
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "I couldn't process that. Please try again.";

    return res.json({ reply });
  } catch (err) {
    console.error("❌ OpenRouter Error:", err);
    return res.status(500).json({
      reply: "AI service error. Please try again later.",
    });
  }
});

export default router;
