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
          content: "You are a medical assistant. Only provide health analysis if the user describes actual symptoms. If the input is not a symptom or is unclear, ask them to describe their symptoms properly. Be concise and professional.",
        },
        {
          role: "user",
          content: `Symptoms: ${symptom}`,
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
