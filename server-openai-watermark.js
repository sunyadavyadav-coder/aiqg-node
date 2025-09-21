import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { createCanvas, loadImage } from "canvas";

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "10mb" }));

// OpenAI API Key comes from Render Environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "AIQG Node server running ✅" });
});

// Generate Image Endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, n = 1, size = "512x512", watermarkText } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    // Call OpenAI Images API
    const openaiResp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        n,
        size,
        model: "gpt-image-1"
      })
    });

    const data = await openaiResp.json();
    if (!data || !data.data) {
      return res.status(500).json({ error: "No image data", details: data });
    }

    const results = [];
    for (const img of data.data) {
      let finalData = img.b64_json ? `data:image/png;base64,${img.b64_json}` : null;

      if (finalData && watermarkText) {
        const buf = Buffer.from(img.b64_json, "base64");
        const src = await loadImage(buf);
        const canvas = createCanvas(src.width, src.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(src, 0, 0);
        ctx.font = "24px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "right";
        ctx.fillText(watermarkText, src.width - 10, src.height - 10);
        finalData = canvas.toDataURL("image/png");
        results.push({ data: finalData, watermarked: true });
      } else if (finalData) {
        results.push({ data: finalData, watermarked: false });
      } else if (img.url) {
        results.push({ url: img.url, watermarked: false });
      }
    }

    res.json({ success: true, output: results, freeRemaining: 5 });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ AIQG server running on port ${PORT}`));
