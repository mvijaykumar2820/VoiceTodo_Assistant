import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing API key. Set GROQ_API_KEY or OPENAI_API_KEY in your environment.");
  process.exit(1);
}

const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(express.static("."));
app.use("/chat", limiter);

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "Hello";

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a concise todo list assistant. Respond very briefly and naturally.
          
When user wants to add a todo, respond: "Todo created" or "Added to your list"
When user completes/removes a todo, respond: "Todo removed" or "Done" or "Marked as complete"
When user asks what's on their list, briefly mention the todos
Keep all responses under 10 words. Be friendly but extremely concise.

Examples:
User: "Add buy groceries to my list"
You: "Todo created"

User: "I finished buying groceries"
You: "Marked as complete"

User: "What do I need to do?"
You: "You have 3 tasks pending"`
        },
        { role: "user", content: userMessage }
      ],
    });

    const text = response.choices[0]?.message?.content || "No response";
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
}

// Export for Vercel serverless
export default app;
