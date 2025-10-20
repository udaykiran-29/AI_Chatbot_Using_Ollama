const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const Redis = require("ioredis");
const path = require("path");

const { loadAllPdfsToVectorStore } = require("./services/pdfService");

const app = express();

// ✅ Trust proxy (fixes X-Forwarded-For issue)
app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 20 requests per minute
  message: { success: false, reply: "Too many requests, try again later." },
});
app.use("/api/", limiter); // only rate-limit API routes

// ✅ Redis client
const redisClient = new Redis();
app.set("redisClient", redisClient);

// ✅ Import chat routes
const chatRoutes = require("./routes/chat");
app.use("/api/chat", chatRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("📄 Loading PDFs into vector store...");

  // 👇 Call the loader at startup
  await loadAllPdfsToVectorStore(path.join(__dirname, "data")); 
  // Put your PDFs in backend/data folder
});

