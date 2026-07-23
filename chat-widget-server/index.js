const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { createCorsMiddleware } = require("./middleware/cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON bodies
app.use(express.json());

// CORS — allowlist only, no wildcard.
// Approved origins are read from ALLOWED_ORIGINS in .env (comma-separated).
app.use(createCorsMiddleware());

// Serve widget.js as a static file
app.use("/public", express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Rate limiting — 20 requests per minute per IP.
// Protects the publicly-reachable chat endpoint from abuse.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Please try again later." },
});

// Validate chat input — ensures messages array is well-formed before
// hitting the Claude API. Rejects missing/empty arrays, oversized messages,
// too many messages, and invalid roles.
function validateChatInput(req, res, next) {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array" });
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: "Too many messages (max 50)" });
  }

  for (const msg of messages) {
    if (!msg.role || !["user", "assistant"].includes(msg.role)) {
      return res.status(400).json({ error: "Each message must have role 'user' or 'assistant'" });
    }

    if (typeof msg.content !== "string" || msg.content.trim().length === 0) {
      return res.status(400).json({ error: "Each message must have non-empty content" });
    }

    if (msg.content.length > 1000) {
      return res.status(400).json({ error: "Message too long (max 1000 characters)" });
    }
  }

  next();
}

// Chat endpoint (streaming response added in Task 4)
app.post("/api/chat", chatLimiter, validateChatInput, (req, res) => {
  res.json({ message: "stub — streaming added in next task" });
});

// Only start listening if this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Chat widget server running on http://localhost:${PORT}`);
  });
}

module.exports = { app };
