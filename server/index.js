const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
const { PROMPT } = require("./utils/prompt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.get("/health", (req, res) => {
  res.send("OK");
});
app.post("/api/respond", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
      config: {
        systemInstruction: PROMPT,
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    console.log(response);
    res.json({ reply: response.candidates[0].content.parts[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
