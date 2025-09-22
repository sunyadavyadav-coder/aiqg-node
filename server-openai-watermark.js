import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "✅ AIQG Node server running!" });
});

// Image generation route
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, n = 1, size = "512x512", watermarkText } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "❌ Prompt is required" });
    }

    // Call OpenAI Images API
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ prompt, n, size })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ success: false, error: data.error });
    }

    // Return images + watermark text
    res.json({
      success: true,
      images: data.data,
      watermark: watermarkText || null
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 AIQG server running on port ${PORT}`);
});
