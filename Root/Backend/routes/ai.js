import express from "express";
const router = express.Router();

let OpenRouter;
let openRouterClient;
(async () => {
  const module = await import("@openrouter/sdk");
  OpenRouter = module.OpenRouter;
})();

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

  // ✅ Ensure OpenRouter ready
  if (!OpenRouter) {
    return res.json({ reply: "AI is loading, please try again in 2 seconds..." });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      reply: "AI service is not configured. Please try again later.",
    });
  }

  try {
    if (!openRouterClient) {
      openRouterClient = new OpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Void Health Assistant",
        },
      });
    }

    const systemPrompt = `
You are HealthAI Assistant.

IMPORTANT:
- If the user is greeting, respond with a greeting.
- ONLY analyze symptoms when the user describes real health symptoms.
- If not symptoms, respond normally like a friendly chatbot.
Never analyze greetings as symptoms.
`;

    const modelList = (
      process.env.OPENROUTER_MODEL_LIST ||
      process.env.OPENROUTER_MODEL ||
      "mistralai/mistral-7b-instruct:free,google/gemma-2-9b-it:free,meta-llama/llama-3.1-8b-instruct:free"
    )
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    let completion;
    let lastError;

    for (const model of modelList) {
      try {
        completion = await openRouterClient.chat.send({
          model,
          max_tokens: 180,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: rawInput },
          ],
        });
        break;
      } catch (error) {
        lastError = error;
        const status =
          error?.status || error?.response?.status || error?.cause?.status;
        const isRetryable = status === 429 || status === 503 || status === 502;
        if (!isRetryable) {
          break;
        }
      }
    }

    if (!completion) {
      console.error("❌ OpenRouter Error:", lastError);
      return res.status(500).json({
        reply: "AI service error. Please try again later.",
      });
    }

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
