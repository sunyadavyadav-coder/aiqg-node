const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// 🔹 Root test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "✅ AIQG Node server चल रहा है" });
});

// 🔹 Image generation route
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, n = 1, size = "512x512", watermarkText } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "❌ Prompt देना ज़रूरी है" });
    }

    // OpenAI API कॉल
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n,
        size
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // 🔹 Response भेजो
    res.json({
      success: true,
      images: data.data,
      watermark: watermarkText || null
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "⚠️ Internal Server Error" });
  }
});

// 🔹 Server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server port ${PORT} पर चल रहा है`);
});
