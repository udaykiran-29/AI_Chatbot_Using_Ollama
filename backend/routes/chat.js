const express = require("express");
const router = express.Router();
const { queryPdf } = require("../services/pdfService");
const { Ollama } = require("ollama");
const Redis = require("ioredis");

// ✅ Redis client (defaults to localhost:6379)
const redis = new Redis();

const ollama = new Ollama({ host: "http://localhost:11434" });

router.post("/message", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const cacheKey = `chat:${message.toLowerCase()}`;

    // ✅ Step 0: Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✅ Answer from Redis cache");
      return res.json({ answer: cached, source: "cache" });
    }

    // ✅ Step 1: Query PDFs for context
    let context = "";
    try {
      context = await queryPdf(message);
    } catch (pdfErr) {
      console.warn("PDF query warning:", pdfErr.message);
    }

    // ✅ Step 2: Ask Ollama
    let reply = "";
    try {
      const response = await ollama.chat({
        model: "llama3",
        messages: [
          {
            role: "system",
            content: `You are Nova's AI support assistant. 
Answer questions naturally and directly. 
If helpful information is found in company documents, use it in your reply. 
Do NOT mention words like "context", "PDF", or file names. 
If no relevant info exists, answer politely using your general knowledge.`,
          },
          {
            role: "user",
            // Instead of "Context: ..." we just blend context + question
            content: `${message}\n\nRelevant company info:\n${context}`,
          },
        ],
        stream: false,
      });

      reply = response?.message?.content?.trim() || "No answer found.";
    } catch (ollamaErr) {
      console.error("Ollama chat error:", ollamaErr.message);
      reply = "Error while fetching answer from model.";
    }

    // ✅ Step 3: Save in Redis (TTL = 1 hour)
    await redis.set(cacheKey, reply, "EX", 3600);

    res.json({ answer: reply, source: "live" });
  } catch (err) {
    console.error("Backend error:", err);
    res
      .status(500)
      .json({ answer: "Oops! Something went wrong.", error: err.message });
  }
});

module.exports = router;



