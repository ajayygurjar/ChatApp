const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getSuggestions = async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.json({ suggestions: [] });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `You are a chat assistant. The user is typing: "${text}"
Complete this message with 3 short, natural continuations (each max 5 words).
Return ONLY a JSON array of strings. No explanation. Example: ["at 5pm", "tomorrow morning", "after lunch"]`,
    });

    const raw = response.text.trim();
    const match = raw.match(/\[.*\]/s);
    const suggestions = match ? JSON.parse(match[0]) : [];

    res.json({ suggestions: suggestions.slice(0, 3) });
  } catch (err) {
    console.error("Gemini suggestions error:", err.message);
    res.json({ suggestions: [] });
  }
};

const getSmartReplies = async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.json({ replies: [] });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `You are a chat assistant. Someone sent this message: "${message}"
Generate 3 short, natural reply options (each max 8 words).
Return ONLY a JSON array of strings. No explanation. Example: ["Yes, I'll be there!", "Running a bit late", "Can we reschedule?"]`,
    });

    const raw = response.text.trim();
    const match = raw.match(/\[.*\]/s);
    const replies = match ? JSON.parse(match[0]) : [];

    res.json({ replies: replies.slice(0, 3) });
  } catch (err) {
    console.error("Gemini smart replies error:", err.message);
    res.json({ replies: [] });
  }
};

module.exports = { getSuggestions, getSmartReplies };
