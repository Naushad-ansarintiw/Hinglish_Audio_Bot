const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const { ElevenLabsClient, play } = require("elevenlabs");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { PROMPT } = require("./utils/prompt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use("/public", express.static(path.join(__dirname, "public")));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVEN_API_KEY });

const createAudioStreamFromText = async (text) => {
  const audioStream = await elevenlabs.textToSpeech.convertAsStream(
    "NeDTo4pprKj2ZwuNJceH",
    {
      text: text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
      },
    }
  );
  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  const content = Buffer.concat(chunks);
  return content;
};

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
    const text = response.candidates[0].content.parts[0].text;
    console.log(text);
    const audioBuffer = await createAudioStreamFromText(text);

    const publicDir = path.join(__dirname, "public");
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

    const filePath = path.join(publicDir, `output-${Date.now()}.mp3`);
    fs.writeFile(filePath, audioBuffer, (err) => {
      if (err) {
        console.error("Error writing audio file:", err);
        return res.status(500).json({ error: "Audio file save error" });
      }
      res.json({ audioUrl: `http://localhost:${PORT}/public/output.mp3` });
    });
    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
