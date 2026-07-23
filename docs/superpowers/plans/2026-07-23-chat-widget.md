# Embeddable AI Chat Widget — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone embeddable chat widget powered by Claude that can be added to any website with a single `<script>` tag, starting with Ora Nutrition.

**Architecture:** Separate Express server (`chat-widget-server/`) handles Claude API calls and serves the widget JS. The widget (`widget.js`) is vanilla JS that injects a chat bubble + panel into any page using Shadow DOM for style isolation. Communication uses streaming SSE.

**Tech Stack:** Node.js, Express, @anthropic-ai/sdk (claude-sonnet-4-6), express-rate-limit, vanilla JavaScript, Shadow DOM

**Spec:** `docs/superpowers/specs/2026-07-23-chat-widget-design.md`

---

## File Structure

```
chat-widget-server/
├── index.js                 ← Express server entry point, middleware setup
├── routes/
│   └── chat.js              ← POST /api/chat endpoint, Claude API streaming
├── middleware/
│   └── cors.js              ← CORS allowlist middleware
├── config/
│   └── prompts.js           ← System prompts per business
├── public/
│   └── widget.js            ← Embeddable widget (served as static file)
├── test.html                ← Local test page for widget development
├── package.json
├── .env                     ← ANTHROPIC_API_KEY + ALLOWED_ORIGINS (gitignored)
├── .env.example             ← Template without secrets
├── .gitignore
└── __tests__/
    ├── health.test.js       ← Health endpoint test
    ├── cors.test.js         ← CORS middleware tests
    ├── validation.test.js   ← Input validation tests
    └── chat.test.js         ← Chat endpoint tests
```

**Integration files (modified later in Task 9):**
- `app/page.tsx` — homepage, add ChatWidget component
- `app/get-started/page.tsx` — wizard page, add ChatWidget component
- `components/chat-widget.tsx` — Next.js wrapper for the `<script>` tag

---

## Task 1: Project Scaffold + Express Server

**Files:**
- Create: `chat-widget-server/package.json`
- Create: `chat-widget-server/.gitignore`
- Create: `chat-widget-server/.env.example`
- Create: `chat-widget-server/.env`
- Create: `chat-widget-server/index.js`
- Create: `chat-widget-server/__tests__/health.test.js`

- [ ] **Step 1: Create feature branch**

```bash
cd C:/Users/tombe/mealprepapp
git checkout -b feat/chat-widget
```

- [ ] **Step 2: Scaffold the project**

```bash
mkdir -p chat-widget-server/routes chat-widget-server/middleware chat-widget-server/config chat-widget-server/public chat-widget-server/__tests__
```

- [ ] **Step 3: Create package.json**

Create `chat-widget-server/package.json`:

```json
{
  "name": "chat-widget-server",
  "version": "1.0.0",
  "description": "Embeddable AI chat widget backend powered by Claude",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "keywords": [],
  "license": "ISC"
}
```

- [ ] **Step 4: Create .gitignore, .env.example, .env**

Create `chat-widget-server/.gitignore`:

```
node_modules/
.env
```

Create `chat-widget-server/.env.example`:

```
ANTHROPIC_API_KEY=your-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
PORT=3001
```

Create `chat-widget-server/.env`:

```
ANTHROPIC_API_KEY=<your actual key>
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500
PORT=3001
```

**Note:** Put your real Anthropic API key in `.env`. This file is gitignored and will never be committed.

- [ ] **Step 5: Install dependencies**

```bash
cd chat-widget-server
npm install express dotenv
npm install --save-dev jest supertest
```

- [ ] **Step 6: Write failing test for health endpoint**

Create `chat-widget-server/__tests__/health.test.js`:

```javascript
const request = require("supertest");
const { app } = require("../index");

describe("GET /health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

```bash
cd chat-widget-server
npm test
```

Expected: FAIL — `Cannot find module '../index'`

- [ ] **Step 8: Create Express server**

Create `chat-widget-server/index.js`:

```javascript
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON bodies
app.use(express.json());

// Serve widget.js as a static file
app.use("/public", express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Only start listening if this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Chat widget server running on http://localhost:${PORT}`);
  });
}

module.exports = { app };
```

- [ ] **Step 9: Run test to verify it passes**

```bash
cd chat-widget-server
npm test
```

Expected: PASS — `GET /health returns status ok`

- [ ] **Step 10: Start the server and verify manually**

```bash
cd chat-widget-server
node index.js
```

In another terminal or browser, visit `http://localhost:3001/health`. Expected response: `{"status":"ok"}`

Stop the server with Ctrl+C.

- [ ] **Step 11: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/
git commit -m "feat(widget): scaffold Express server with health endpoint"
```

---

## Task 2: CORS Allowlist Middleware

**Files:**
- Create: `chat-widget-server/middleware/cors.js`
- Modify: `chat-widget-server/index.js`
- Create: `chat-widget-server/__tests__/cors.test.js`

- [ ] **Step 1: Write failing tests for CORS**

Create `chat-widget-server/__tests__/cors.test.js`:

```javascript
const request = require("supertest");
const { app } = require("../index");

describe("CORS middleware", () => {
  it("allows requests from whitelisted origins", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:3000");

    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    );
  });

  it("blocks requests from non-whitelisted origins", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "https://evil-site.com");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("handles preflight OPTIONS requests", async () => {
    const res = await request(app)
      .options("/health")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "POST");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd chat-widget-server
npm test
```

Expected: FAIL — no CORS headers in response

- [ ] **Step 3: Create CORS middleware**

Create `chat-widget-server/middleware/cors.js`:

```javascript
function createCorsMiddleware() {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return (req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
      );
      res.setHeader("Access-Control-Max-Age", "86400");
    }

    // Handle preflight
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  };
}

module.exports = { createCorsMiddleware };
```

- [ ] **Step 4: Wire CORS middleware into index.js**

Add to `chat-widget-server/index.js`, after `app.use(express.json())`:

```javascript
const { createCorsMiddleware } = require("./middleware/cors");

// CORS — allowlist only, no wildcard
app.use(createCorsMiddleware());
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd chat-widget-server
npm test
```

Expected: All CORS tests PASS

- [ ] **Step 6: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/
git commit -m "feat(widget): add CORS allowlist middleware"
```

---

## Task 3: Rate Limiting + Input Validation

**Files:**
- Modify: `chat-widget-server/index.js`
- Create: `chat-widget-server/__tests__/validation.test.js`

- [ ] **Step 1: Install express-rate-limit**

```bash
cd chat-widget-server
npm install express-rate-limit
```

- [ ] **Step 2: Write failing tests for input validation**

Create `chat-widget-server/__tests__/validation.test.js`:

```javascript
const request = require("supertest");
const { app } = require("../index");

describe("POST /api/chat input validation", () => {
  it("rejects request without messages array", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Origin", "http://localhost:3000")
      .send({ business: "test" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/messages/i);
  });

  it("rejects request with empty messages array", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Origin", "http://localhost:3000")
      .send({ messages: [], business: "test" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/messages/i);
  });

  it("rejects message longer than 1000 characters", async () => {
    const longMessage = "a".repeat(1001);
    const res = await request(app)
      .post("/api/chat")
      .set("Origin", "http://localhost:3000")
      .send({
        messages: [{ role: "user", content: longMessage }],
        business: "test",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/long/i);
  });

  it("rejects conversation with more than 50 messages", async () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: "hello",
    }));

    const res = await request(app)
      .post("/api/chat")
      .set("Origin", "http://localhost:3000")
      .send({ messages, business: "test" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/too many/i);
  });

  it("rejects invalid role", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Origin", "http://localhost:3000")
      .send({
        messages: [{ role: "system", content: "hello" }],
        business: "test",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/role/i);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd chat-widget-server
npm test
```

Expected: FAIL — no `/api/chat` route exists yet, will get 404

- [ ] **Step 4: Add rate limiting and stub chat route with validation**

Add to `chat-widget-server/index.js`, after CORS middleware:

```javascript
const rateLimit = require("express-rate-limit");

// Rate limiting — 20 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Please try again later." },
});
```

Add the chat route at the bottom (before `module.exports`):

```javascript
// Validate chat input
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
      return res
        .status(400)
        .json({ error: "Each message must have role 'user' or 'assistant'" });
    }

    if (typeof msg.content !== "string" || msg.content.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Each message must have non-empty content" });
    }

    if (msg.content.length > 1000) {
      return res
        .status(400)
        .json({ error: "Message too long (max 1000 characters)" });
    }
  }

  next();
}

// Chat endpoint (streaming response added in Task 4)
app.post("/api/chat", chatLimiter, validateChatInput, (req, res) => {
  res.json({ message: "stub — streaming added in next task" });
});
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd chat-widget-server
npm test
```

Expected: All validation tests PASS

- [ ] **Step 6: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/
git commit -m "feat(widget): add rate limiting and input validation"
```

---

## Task 4: Chat Endpoint with Claude API Streaming

**Files:**
- Create: `chat-widget-server/routes/chat.js`
- Create: `chat-widget-server/config/prompts.js`
- Modify: `chat-widget-server/index.js` — replace stub route with real route
- Create: `chat-widget-server/__tests__/chat.test.js`

- [ ] **Step 1: Install Anthropic SDK**

```bash
cd chat-widget-server
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Create system prompts config**

Create `chat-widget-server/config/prompts.js`:

```javascript
const prompts = {
  default: `You are a helpful assistant embedded as a chat widget on a website. 
Be concise and friendly. Keep responses under 200 words unless the user asks for detail.
Format responses with markdown when helpful (bold, lists, code blocks).`,

  "ora-nutrition": `You are a helpful nutrition assistant for Ora Nutrition, a meal prep delivery service.
You help users with:
1. Using the Ora Nutrition app — navigating the menu, choosing plans, understanding the wizard
2. Food and nutrition questions — macros, calories, dietary advice, ingredient questions
3. Meal prep tips and healthy eating guidance

Be concise, friendly, and encouraging. Keep responses under 200 words unless the user asks for detail.
Format responses with markdown when helpful (bold, lists).
If asked about specific meals or prices, explain that the menu changes weekly and direct users to the Menu page.
Do not give medical advice — suggest consulting a healthcare provider for medical dietary needs.`,
};

function getSystemPrompt(business) {
  return prompts[business] || prompts.default;
}

module.exports = { getSystemPrompt };
```

- [ ] **Step 3: Create the chat route with streaming**

Create `chat-widget-server/routes/chat.js`:

```javascript
const Anthropic = require("@anthropic-ai/sdk").default;
const { getSystemPrompt } = require("../config/prompts");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function handleChat(req, res) {
  const { messages, business } = req.body;
  const systemPrompt = getSystemPrompt(business || "default");

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Claude API error:", error.message);

    // If headers already sent (streaming started), end the stream
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: "An error occurred. Please try again." })}\n\n`
      );
      res.write("data: [DONE]\n\n");
      res.end();
    } else {
      res.status(500).json({ error: "Failed to get response from AI" });
    }
  }
}

module.exports = { handleChat };
```

- [ ] **Step 4: Wire chat route into index.js**

In `chat-widget-server/index.js`, replace the stub chat endpoint:

```javascript
// Remove this line:
// app.post("/api/chat", chatLimiter, validateChatInput, (req, res) => {
//   res.json({ message: "stub — streaming added in next task" });
// });

// Replace with:
const { handleChat } = require("./routes/chat");

app.post("/api/chat", chatLimiter, validateChatInput, handleChat);
```

- [ ] **Step 5: Write test for chat endpoint**

Create `chat-widget-server/__tests__/chat.test.js`:

```javascript
const request = require("supertest");
const { app } = require("../index");

describe("POST /api/chat", () => {
  it("returns streaming SSE response for valid input", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Origin", "http://localhost:3000")
      .send({
        messages: [{ role: "user", content: "Say hello in one word" }],
        business: "default",
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
    // Response body should contain SSE data lines and end with [DONE]
    expect(res.text).toContain("data:");
    expect(res.text).toContain("[DONE]");
  });

  it("uses ora-nutrition prompt when business is ora-nutrition", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Origin", "http://localhost:3000")
      .send({
        messages: [{ role: "user", content: "What do you help with?" }],
        business: "ora-nutrition",
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain("data:");
  });
});
```

- [ ] **Step 6: Run tests**

```bash
cd chat-widget-server
npm test
```

Expected: All tests PASS (requires valid `ANTHROPIC_API_KEY` in `.env`)

- [ ] **Step 7: Test manually with curl**

Start the server:

```bash
cd chat-widget-server
node index.js
```

In PowerShell, test streaming:

```powershell
curl -X POST http://localhost:3001/api/chat `
  -H "Content-Type: application/json" `
  -H "Origin: http://localhost:3000" `
  -d '{"messages":[{"role":"user","content":"Say hello"}],"business":"default"}'
```

Expected: streaming `data: {"text":"..."}` chunks followed by `data: [DONE]`

Stop the server with Ctrl+C.

- [ ] **Step 8: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/
git commit -m "feat(widget): add streaming chat endpoint with Claude API"
```

---

## Task 5: Widget Bubble — Shadow DOM + Open/Close

**Files:**
- Create: `chat-widget-server/public/widget.js`
- Create: `chat-widget-server/test.html`

- [ ] **Step 1: Create the widget with floating bubble and empty panel**

Create `chat-widget-server/public/widget.js`:

```javascript
(function () {
  "use strict";

  // Find our own script tag to read config
  const scriptTag = document.currentScript;
  const serverUrl = scriptTag.src.replace(/\/public\/widget\.js$/, "");

  // Read configuration from data attributes
  const config = {
    business: scriptTag.getAttribute("data-business") || "Assistant",
    accent: scriptTag.getAttribute("data-accent") || "#6366f1",
    welcome:
      scriptTag.getAttribute("data-welcome") || "How can I help you today?",
  };

  // Create host element and attach Shadow DOM
  const host = document.createElement("div");
  host.id = "chat-widget-host";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "closed" });

  // Compute a darker accent for hover states
  function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  const [h, s, l] = hexToHsl(config.accent);
  const accentHover = `hsl(${h}, ${s}%, ${Math.max(l - 8, 0)}%)`;

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .widget-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${config.accent};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 2147483647;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .widget-bubble:hover {
      transform: scale(1.08);
      background: ${accentHover};
    }

    .widget-bubble svg {
      width: 26px;
      height: 26px;
      fill: white;
    }

    .widget-bubble.open svg.icon-chat { display: none; }
    .widget-bubble.open svg.icon-close { display: block; }
    .widget-bubble:not(.open) svg.icon-chat { display: block; }
    .widget-bubble:not(.open) svg.icon-close { display: none; }

    .widget-panel {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      height: 520px;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #1e1e2e;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 2147483646;
      opacity: 0;
      transform: translateY(16px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .widget-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .widget-header {
      background: linear-gradient(135deg, ${config.accent}, ${config.accent}cc);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .widget-header-title {
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 15px;
      font-weight: 600;
    }

    .widget-header-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0 4px;
      opacity: 0.8;
      transition: opacity 0.15s;
    }

    .widget-header-close:hover {
      opacity: 1;
    }

    .widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #e2e8f0;
    }

    .widget-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      word-wrap: break-word;
    }

    .widget-msg.bot {
      align-self: flex-start;
      background: #2a2a3e;
      border-bottom-left-radius: 4px;
    }

    .widget-msg.user {
      align-self: flex-end;
      background: ${config.accent};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .widget-typing {
      align-self: flex-start;
      padding: 10px 14px;
      background: #2a2a3e;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      display: none;
    }

    .widget-typing.visible {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .widget-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #94a3b8;
      animation: typing-bounce 1.2s infinite;
    }

    .widget-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .widget-typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }

    .widget-input-bar {
      padding: 12px;
      border-top: 1px solid #2a2a3e;
      display: flex;
      gap: 8px;
    }

    .widget-input {
      flex: 1;
      background: #2a2a3e;
      border: 1px solid #3a3a4e;
      border-radius: 8px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-family: inherit;
      font-size: 14px;
      outline: none;
      resize: none;
      min-height: 40px;
      max-height: 100px;
    }

    .widget-input:focus {
      border-color: ${config.accent};
    }

    .widget-input::placeholder {
      color: #64748b;
    }

    .widget-send {
      background: ${config.accent};
      border: none;
      border-radius: 8px;
      color: white;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }

    .widget-send:hover {
      background: ${accentHover};
    }

    .widget-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .widget-panel {
        width: calc(100vw - 16px);
        height: calc(100vh - 120px);
        right: 8px;
        bottom: 88px;
        border-radius: 12px;
      }
    }
  `;

  // Build HTML structure
  const container = document.createElement("div");
  container.innerHTML = `
    <button class="widget-bubble" aria-label="Open chat">
      <svg class="icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
      </svg>
      <svg class="icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>

    <div class="widget-panel">
      <div class="widget-header">
        <span class="widget-header-title">${config.business}</span>
        <button class="widget-header-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="widget-messages"></div>
      <div class="widget-input-bar">
        <textarea class="widget-input" placeholder="Type a message..." rows="1"></textarea>
        <button class="widget-send" disabled>Send</button>
      </div>
    </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(container);

  // DOM references
  const bubble = shadow.querySelector(".widget-bubble");
  const panel = shadow.querySelector(".widget-panel");
  const closeBtn = shadow.querySelector(".widget-header-close");

  // Toggle open/close
  let isOpen = false;

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    bubble.classList.toggle("open", isOpen);
  }

  bubble.addEventListener("click", togglePanel);
  closeBtn.addEventListener("click", togglePanel);

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      togglePanel();
    }
  });
})();
```

- [ ] **Step 2: Create test page**

Create `chat-widget-server/test.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Widget Test Page</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0f0f1a;
      color: #e2e8f0;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { color: #6366f1; margin-bottom: 16px; }
    p { line-height: 1.7; color: #94a3b8; margin-bottom: 12px; }
    .card {
      background: #1e1e2e;
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>Ora Nutrition — Test Page</h1>
  <div class="card">
    <h2>Weekly Meal Prep</h2>
    <p>This is a test page to verify the chat widget works correctly. The chat bubble should appear in the bottom-right corner.</p>
    <p>Click the bubble to open the chat panel. Click X or press Escape to close it.</p>
  </div>
  <div class="card">
    <h2>Test Checklist</h2>
    <p>1. Bubble visible in bottom-right? ✓/✗</p>
    <p>2. Click bubble — panel opens with slide-up animation? ✓/✗</p>
    <p>3. Click X — panel closes? ✓/✗</p>
    <p>4. Press Escape — panel closes? ✓/✗</p>
    <p>5. Bubble icon changes between chat and close? ✓/✗</p>
    <p>6. Host page styles are NOT affected? ✓/✗</p>
  </div>

  <script src="http://localhost:3001/public/widget.js"
    data-business="Ora Nutrition"
    data-accent="#6366f1"
    data-welcome="Hi! I'm your nutrition assistant. Ask me about meals, macros, or how to use the app 🥗">
  </script>
</body>
</html>
```

- [ ] **Step 3: Test in browser**

Start the server:

```bash
cd chat-widget-server
node index.js
```

Open `chat-widget-server/test.html` directly in the browser (double-click the file, or use Live Server extension). Verify:

1. Bubble appears bottom-right
2. Click bubble — panel slides up with animation
3. Header shows "Ora Nutrition"
4. Click X or press Escape — panel closes
5. Bubble icon toggles between chat and close icons
6. Host page styles are not affected by widget

- [ ] **Step 4: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/
git commit -m "feat(widget): add floating bubble with Shadow DOM and open/close panel"
```

---

## Task 6: Chat UI — Messages, Streaming, Typing Indicator

**Files:**
- Modify: `chat-widget-server/public/widget.js`

This task adds the chat functionality to the existing widget: sending messages, streaming responses, displaying the typing indicator, and rendering the welcome message.

- [ ] **Step 1: Add chat logic to widget.js**

Add the following code inside the IIFE in `chat-widget-server/public/widget.js`, after the Escape key listener and before the closing `})();`:

```javascript
  // ─── Chat Logic ────────────────────────────────────────────────

  const messagesEl = shadow.querySelector(".widget-messages");
  const inputEl = shadow.querySelector(".widget-input");
  const sendBtn = shadow.querySelector(".widget-send");
  const typingEl = createTypingIndicator();

  // Conversation state (session-based — lost on page refresh)
  const messages = [];
  let isStreaming = false;

  // Create typing indicator element
  function createTypingIndicator() {
    const el = document.createElement("div");
    el.className = "widget-typing";
    el.innerHTML = `
      <div class="widget-typing-dot"></div>
      <div class="widget-typing-dot"></div>
      <div class="widget-typing-dot"></div>
    `;
    messagesEl.appendChild(el);
    return el;
  }

  // Add welcome message
  function addWelcomeMessage() {
    appendMessage("bot", config.welcome);
  }

  // Append a message to the UI
  function appendMessage(role, content) {
    const msgEl = document.createElement("div");
    msgEl.className = `widget-msg ${role === "user" ? "user" : "bot"}`;
    msgEl.textContent = content;
    messagesEl.insertBefore(msgEl, typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msgEl;
  }

  // Enable/disable send button based on input
  inputEl.addEventListener("input", () => {
    sendBtn.disabled = inputEl.value.trim().length === 0 || isStreaming;
    // Auto-resize textarea
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + "px";
  });

  // Send on Enter (Shift+Enter for new line)
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  async function sendMessage() {
    const content = inputEl.value.trim();
    if (!content || isStreaming) return;

    // Add user message to UI and state
    appendMessage("user", content);
    messages.push({ role: "user", content });

    // Clear input
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;
    isStreaming = true;

    // Show typing indicator
    typingEl.classList.add("visible");
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Create bot message element for streaming
    const botMsgEl = document.createElement("div");
    botMsgEl.className = "widget-msg bot";
    messagesEl.insertBefore(botMsgEl, typingEl);

    let fullResponse = "";

    try {
      const response = await fetch(`${serverUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, business: config.business }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Hide typing indicator once first chunk arrives
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              fullResponse += parsed.error;
              botMsgEl.textContent = fullResponse;
              break;
            }

            if (parsed.text) {
              if (firstChunk) {
                typingEl.classList.remove("visible");
                firstChunk = false;
              }
              fullResponse += parsed.text;
              botMsgEl.textContent = fullResponse;
              messagesEl.scrollTop = messagesEl.scrollHeight;
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    } catch (error) {
      fullResponse = "Sorry, something went wrong. Please try again.";
      botMsgEl.textContent = fullResponse;
    }

    // Hide typing indicator and save response
    typingEl.classList.remove("visible");
    messages.push({ role: "assistant", content: fullResponse });
    isStreaming = false;
    sendBtn.disabled = inputEl.value.trim().length === 0;
  }

  // Show welcome message when panel first opens
  let welcomed = false;
  const originalToggle = togglePanel;

  // We need to patch togglePanel — redefine it
  bubble.removeEventListener("click", togglePanel);
  closeBtn.removeEventListener("click", togglePanel);

  function togglePanelWithWelcome() {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    bubble.classList.toggle("open", isOpen);

    if (isOpen && !welcomed) {
      welcomed = true;
      addWelcomeMessage();
    }

    if (isOpen) {
      inputEl.focus();
    }
  }

  bubble.addEventListener("click", togglePanelWithWelcome);
  closeBtn.addEventListener("click", togglePanelWithWelcome);
```

**Important:** Also update the original `togglePanel` references. Remove the original `togglePanel` function and the original event listeners for `bubble` and `closeBtn` from the earlier part of the code, and replace them entirely with `togglePanelWithWelcome`. The cleanest approach is to restructure so there's only one toggle function. The final widget.js should have this single toggle function instead of two.

- [ ] **Step 2: Test in browser**

Start the server:

```bash
cd chat-widget-server
node index.js
```

Open `test.html` in the browser. Verify:

1. Open panel — welcome message appears
2. Type a message and press Enter — user message appears
3. Typing indicator (3 dots) shows while waiting
4. Bot response streams in word by word
5. Send button is disabled during streaming
6. Shift+Enter creates new line in input
7. Auto-scroll works for long conversations
8. Close and reopen — messages are still there (session-based)

- [ ] **Step 3: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/
git commit -m "feat(widget): add chat UI with streaming and typing indicator"
```

---

## Task 7: Per-Client Config Verification

**Files:**
- Modify: `chat-widget-server/test.html`

The config reading is already built into `widget.js` from Task 5. This task verifies it works by testing two different widget configs on the same page.

- [ ] **Step 1: Update test page with two widget instances**

Replace the content of `chat-widget-server/test.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Widget — Config Test</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0f0f1a;
      color: #e2e8f0;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { color: #6366f1; margin-bottom: 16px; }
    p { line-height: 1.7; color: #94a3b8; margin-bottom: 12px; }
    .card {
      background: #1e1e2e;
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
    }
    code {
      background: #2a2a3e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>Chat Widget — Per-Client Config Test</h1>

  <div class="card">
    <h2>Active Config</h2>
    <p>Business: <code>Ora Nutrition</code></p>
    <p>Accent: <code>#6366f1</code> (purple)</p>
    <p>Welcome: <code>Hi! I'm your nutrition assistant 🥗</code></p>
  </div>

  <div class="card">
    <h2>Test Checklist</h2>
    <p>1. Header shows "Ora Nutrition"? ✓/✗</p>
    <p>2. Bubble is purple (#6366f1)? ✓/✗</p>
    <p>3. Welcome message matches data-welcome? ✓/✗</p>
    <p>4. User messages have purple background? ✓/✗</p>
  </div>

  <div class="card">
    <h2>To test another config</h2>
    <p>Change the <code>data-*</code> attributes below and refresh:</p>
    <p><code>data-business</code> — name in header</p>
    <p><code>data-accent</code> — bubble/header/message color</p>
    <p><code>data-welcome</code> — first bot message</p>
  </div>

  <script src="http://localhost:3001/public/widget.js"
    data-business="Ora Nutrition"
    data-accent="#6366f1"
    data-welcome="Hi! I'm your nutrition assistant. Ask me about meals, macros, or how to use the app 🥗">
  </script>
</body>
</html>
```

- [ ] **Step 2: Test with default config**

Open `test.html` in browser. Verify header says "Ora Nutrition", bubble is purple, welcome message matches.

- [ ] **Step 3: Test with different config**

Temporarily change the `<script>` tag attributes in `test.html`:

```html
<script src="http://localhost:3001/public/widget.js"
  data-business="Pizza Palace"
  data-accent="#ef4444"
  data-welcome="Welcome! Ask me about our menu or place an order 🍕">
</script>
```

Refresh the page. Verify header says "Pizza Palace", bubble is red, welcome message changed.

**Revert back to Ora Nutrition config** after testing.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/
git commit -m "feat(widget): verify per-client config with updated test page"
```

---

## Task 8: UX Polish — Animations, Markdown, Mobile

**Files:**
- Modify: `chat-widget-server/public/widget.js`

- [ ] **Step 1: Add markdown rendering function**

Add this function inside the IIFE in `widget.js`, before the `appendMessage` function:

```javascript
  // ─── Lightweight Markdown Parser ───────────────────────────────

  function renderMarkdown(text) {
    // Escape HTML to prevent XSS
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks: ```...```
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre style="background:#1a1a2a;padding:10px;border-radius:6px;overflow-x:auto;margin:6px 0;font-size:13px;"><code>${code.trim()}</code></pre>`;
    });

    // Inline code: `...`
    html = html.replace(/`([^`]+)`/g, (_, code) => {
      return `<code style="background:#1a1a2a;padding:1px 5px;border-radius:3px;font-size:13px;">${code}</code>`;
    });

    // Bold: **...**
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic: *...*
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Unordered lists: - item or * item
    html = html.replace(/^[*-] (.+)$/gm, (_, item) => {
      return `<li style="margin-left:18px;list-style:disc;">${item}</li>`;
    });

    // Ordered lists: 1. item
    html = html.replace(/^\d+\. (.+)$/gm, (_, item) => {
      return `<li style="margin-left:18px;list-style:decimal;">${item}</li>`;
    });

    // Line breaks
    html = html.replace(/\n/g, "<br>");

    return html;
  }
```

- [ ] **Step 2: Update appendMessage to use markdown for bot messages**

Replace the existing `appendMessage` function:

```javascript
  function appendMessage(role, content) {
    const msgEl = document.createElement("div");
    msgEl.className = `widget-msg ${role === "user" ? "user" : "bot"}`;

    if (role === "user") {
      msgEl.textContent = content;
    } else {
      msgEl.innerHTML = renderMarkdown(content);
    }

    messagesEl.insertBefore(msgEl, typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msgEl;
  }
```

- [ ] **Step 3: Update streaming to render markdown on completion**

In the `sendMessage` function, after the streaming while loop ends and the full response is saved, update the bot message element to use markdown:

Find this section in `sendMessage`:

```javascript
    // Hide typing indicator and save response
    typingEl.classList.remove("visible");
    messages.push({ role: "assistant", content: fullResponse });
```

Add markdown rendering right before it:

```javascript
    // Render final markdown
    botMsgEl.innerHTML = renderMarkdown(fullResponse);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Hide typing indicator and save response
    typingEl.classList.remove("visible");
    messages.push({ role: "assistant", content: fullResponse });
```

- [ ] **Step 4: Test in browser**

Start server and open `test.html`. Ask the bot:
- "Give me a bulleted list of 3 high-protein foods" — should render as a list
- "What is **creatine**?" — should render bold text
- "Show me a code example" — should render code block

Test mobile: resize browser to under 480px width. Panel should expand to full width.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/
git commit -m "feat(widget): add markdown rendering and mobile responsivity"
```

---

## Task 9: Next.js Integration

**Files:**
- Create: `components/chat-widget.tsx`
- Modify: `app/page.tsx`
- Modify: `app/get-started/page.tsx`

- [ ] **Step 1: Create ChatWidget component**

Create `components/chat-widget.tsx`:

```tsx
"use client";

import Script from "next/script";

interface ChatWidgetProps {
  serverUrl?: string;
  business?: string;
  accent?: string;
  welcome?: string;
}

export default function ChatWidget({
  serverUrl = "http://localhost:3001",
  business = "Ora Nutrition",
  accent = "#6366f1",
  welcome = "Hi! I'm your nutrition assistant. Ask me about meals, macros, or how to use the app 🥗",
}: ChatWidgetProps) {
  return (
    <Script
      src={`${serverUrl}/public/widget.js`}
      data-business={business}
      data-accent={accent}
      data-welcome={welcome}
      strategy="lazyOnload"
    />
  );
}
```

- [ ] **Step 2: Add widget to homepage**

In `app/page.tsx`, add the import and component:

```tsx
import ChatWidget from "@/components/chat-widget";
```

Add `<ChatWidget />` at the end, inside the fragment:

```tsx
export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <MealPreview />
      <PlanCards />

      {/* CTA Banner */}
      {/* ... existing CTA code ... */}

      <ChatWidget />
    </>
  );
}
```

- [ ] **Step 3: Add widget to wizard page**

In `app/get-started/page.tsx`, add the import and component:

```tsx
import ChatWidget from "@/components/chat-widget";
```

Add `<ChatWidget />` after the Suspense block:

```tsx
export default async function GetStartedPage() {
  const meals = await getProducts();

  return (
    <>
      <Suspense fallback={<div className="min-h-[80vh] bg-[#e8e8e4]" />}>
        <WizardContent meals={meals} />
      </Suspense>
      <ChatWidget />
    </>
  );
}
```

- [ ] **Step 4: Test on live app**

Start both servers:

Terminal 1:
```bash
cd chat-widget-server
node index.js
```

Terminal 2:
```bash
cd C:/Users/tombe/mealprepapp
npm run dev
```

Open `http://localhost:3000` — verify:
1. Chat bubble appears on homepage
2. Chat works (send a message, get a streaming response)
3. Navigate to Get Started (wizard) — bubble appears there too
4. Chat works on wizard page
5. Navigate to other pages (Menu, About) — no bubble (widget only on homepage + wizard)
6. No style conflicts between widget and the app

- [ ] **Step 5: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add components/chat-widget.tsx app/page.tsx app/get-started/page.tsx
git commit -m "feat(widget): integrate chat widget into homepage and wizard"
```

---

## Task 10: Documentation

**Files:**
- Create: `chat-widget-server/README.md`

- [ ] **Step 1: Create README**

Create `chat-widget-server/README.md`:

````markdown
# Embeddable AI Chat Widget

A universal chat widget powered by Claude AI. Add it to any website with a single `<script>` tag.

## Quick Start

### 1. Install dependencies

```bash
cd chat-widget-server
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and add your Anthropic API key:

```bash
cp .env.example .env
```

Edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
ALLOWED_ORIGINS=https://yoursite.com,http://localhost:3000
PORT=3001
```

### 3. Start the server

```bash
npm run dev
```

### 4. Add to your website

Paste this into your HTML, before `</body>`:

```html
<script
  src="https://your-server-url.com/public/widget.js"
  data-business="Your Business Name"
  data-accent="#6366f1"
  data-welcome="Hi! How can I help you today?">
</script>
```

## Configuration

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-business` | `"Assistant"` | Name shown in chat header |
| `data-accent` | `"#6366f1"` | Accent color (bubble, header, user messages) |
| `data-welcome` | `"How can I help you today?"` | First message from the bot |

## Adding a new client domain

Add the domain to `ALLOWED_ORIGINS` in `.env`, comma-separated:

```
ALLOWED_ORIGINS=https://existing-client.com,https://new-client.com
```

Restart the server.

## Adding a custom system prompt

Edit `config/prompts.js` and add a new entry:

```javascript
"your-business": `Your custom system prompt here...`
```

Set `data-business` to match the key (e.g., `data-business="your-business"`).

## Next.js Integration

Use the `ChatWidget` component:

```tsx
import ChatWidget from "@/components/chat-widget";

export default function Page() {
  return (
    <>
      {/* Your page content */}
      <ChatWidget
        serverUrl="https://your-server-url.com"
        business="Your Business"
      />
    </>
  );
}
```

## Tech Stack

- **Backend:** Node.js, Express
- **AI:** Claude Sonnet (via @anthropic-ai/sdk), streaming responses
- **Frontend:** Vanilla JavaScript, Shadow DOM for style isolation
- **Protection:** CORS allowlist, rate limiting (20 req/min/IP), input validation
````

- [ ] **Step 2: Commit**

```bash
cd C:/Users/tombe/mealprepapp
git add chat-widget-server/README.md
git commit -m "docs(widget): add README with setup and embed instructions"
```

---

## Summary

| Task | Phase | Commit message |
|------|-------|---------------|
| 1 | Setup | `feat(widget): scaffold Express server with health endpoint` |
| 2 | CORS | `feat(widget): add CORS allowlist middleware` |
| 3 | Rate limit | `feat(widget): add rate limiting and input validation` |
| 4 | Chat API | `feat(widget): add streaming chat endpoint with Claude API` |
| 5 | Bubble | `feat(widget): add floating bubble with Shadow DOM and open/close panel` |
| 6 | Chat UI | `feat(widget): add chat UI with streaming and typing indicator` |
| 7 | Config | `feat(widget): verify per-client config with updated test page` |
| 8 | Polish | `feat(widget): add markdown rendering and mobile responsivity` |
| 9 | Integration | `feat(widget): integrate chat widget into homepage and wizard` |
| 10 | Docs | `docs(widget): add README with setup and embed instructions` |
