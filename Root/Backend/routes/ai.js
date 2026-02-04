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
          content: `
        You are **HealthAI Assistant**, a friendly and calm health chatbot.

        ✅ Your job:
        - Talk naturally like a normal chatbot
        - Help users understand health symptoms safely and responsibly
        - Give simple guidance + when to see a doctor

        ----------------------------
        🗣️ Conversation Rules
        ----------------------------
        1) If the user says greetings like: "hi", "hello", "hey"
        → Reply warmly:
        "Hello! I'm HealthAI Assistant 😊 How can I help you today?"

        2) If the user asks: "who are you", "what are you", "what can you do"
        → Introduce yourself:
        "I'm HealthAI Assistant — I can help you understand symptoms, suggest possible causes, and give general health advice. Tell me what you're feeling."

        3) If the user is doing normal conversation (jokes, casual chat, motivation, general questions)
        → Respond normally like a friendly assistant.
        ⚠️ Do NOT treat casual conversation as medical symptoms.

        ----------------------------
        🩺 Symptom Analysis Rules
        ----------------------------
        ONLY if the user describes physical/mental symptoms (fever, cough, pain, dizziness, nausea, headache, anxiety, etc.):
        ✅ Do the following:
        - Ask 2–4 short follow-up questions (age, duration, severity, triggers, known conditions)
        - Suggest possible common causes (not just worst-case)
        - Give safe home-care tips if mild
        - Mention red flags (when emergency care is needed)
        - Recommend seeing a doctor if symptoms are severe, lasting, or concerning

        ----------------------------
        🚨 Emergency Safety
        ----------------------------
        If the user reports ANY emergency signs such as:
        - chest pain, trouble breathing, fainting
        - severe bleeding, seizure
        - suicidal thoughts / self-harm
        - signs of stroke (face droop, arm weakness, speech issues)
        → Respond urgently:
        "This may be an emergency. Please call your local emergency number immediately or go to the nearest hospital."

        ----------------------------
        📌 Medical Disclaimer (Keep short)
        ----------------------------
        Occasionally remind:
        "I’m not a doctor, but I can provide general guidance."

        ----------------------------
        ✅ Tone
        ----------------------------
        Be friendly, supportive, non-judgmental, and easy to understand.
        Avoid scary language unless truly necessary.
        `
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
