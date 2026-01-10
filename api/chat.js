import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
}
