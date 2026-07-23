# Embeddable AI Chat Widget — Design Spec

## Overview

A universal embeddable chat widget — a floating chat bubble that any website owner can add with a single `<script>` tag. It expands into an AI chat powered by Claude. First deployment target: the Ora Nutrition meal prep app (homepage + wizard).

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend architecture | Separate Express server (`chat-widget-server/`) | Keeps widget portable and sellable — any client can deploy it independently of Next.js |
| Style isolation | Shadow DOM | Reliable CSS isolation without iframe overhead. No extra HTTP request, simple communication with host page, modern browser support |
| Per-client config | `data-*` attributes on `<script>` tag | Zero-JS setup for clients. Industry standard (Intercom, Crisp). Read via `document.currentScript` |
| Conversation model | Session-based | Messages persist in JS array during page visit. Lost on refresh. No database needed |
| Bubble position | Bottom-right | Industry standard, users expect it there |
| Widget pages | Homepage + wizard | Where users most need help with meals and nutrition questions |

## Architecture

```
┌─────────────────────────────────┐
│  Host page (any website)        │
│                                 │
│  <script src=".../widget.js"    │
│    data-business="Ora Nutrition"│
│    data-accent="#6366f1" />      │
│                                 │
│  ┌───────────────────────┐      │
│  │ Shadow DOM             │      │
│  │  - Chat bubble         │      │
│  │  - Chat panel          │      │
│  │  - All styles          │      │
│  └──────────┬────────────┘      │
└─────────────┼───────────────────┘
              │ fetch (streaming SSE)
              ▼
┌─────────────────────────────────┐
│  Express Server (standalone)    │
│  chat-widget-server/            │
│                                 │
│  POST /api/chat                 │
│  ├─ CORS allowlist              │
│  ├─ Rate limiting (20/min/IP)   │
│  ├─ Input validation            │
│  └─ Claude API (streaming)      │
│                                 │
│  GET /widget.js (static file)   │
└─────────────────────────────────┘
```

Two separate processes. Widget JS runs on the client's page in Shadow DOM. Express server handles AI communication and serves `widget.js` as a static file.

## Backend — Express Server

### File structure

```
chat-widget-server/
├── index.js              ← Express server, middleware setup
├── routes/
│   └── chat.js           ← POST /api/chat, Claude API streaming
├── middleware/
│   └── cors.js           ← CORS allowlist configuration
├── config/
│   └── prompts.js        ← System prompts per business
├── public/
│   └── widget.js         ← Served as static file
├── package.json
├── .env                  ← ANTHROPIC_API_KEY + ALLOWED_ORIGINS
├── .env.example          ← Template without secrets
└── .gitignore
```

### Endpoint: POST /api/chat

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What's the protein in the chicken bowl?" },
    { "role": "assistant", "content": "The Grilled Chicken Power Bowl has 42g..." },
    { "role": "user", "content": "Any lower carb options?" }
  ],
  "business": "ora-nutrition"
}
```

- `messages`: Full conversation history (session-based, sent from widget each time)
- `business`: Client identifier, maps to a system prompt in `config/prompts.js`

**Response:** Streaming via SSE (`text/event-stream`)
- Each chunk: `data: {"text": "partial response..."}\n\n`
- End signal: `data: [DONE]\n\n`

### CORS

- `ALLOWED_ORIGINS` env var: comma-separated list of allowed origins
- Example: `ALLOWED_ORIGINS=https://oranutri.com,http://localhost:3000`
- Middleware checks `Origin` header against this list
- No wildcard `*` — each client domain must be explicitly added

### Rate limiting

- `express-rate-limit`: 20 requests per minute per IP
- Returns `429 Too Many Requests` when exceeded

### Input validation

- Max message length: 1000 characters
- Max messages in conversation: 50
- Input sanitization against injection

### System prompts (config/prompts.js)

- Default prompt for generic widget usage
- Ora Nutrition prompt: helps with app usage AND food/nutrition questions
- Mapped via `business` parameter from request
- For v1: two hardcoded prompts only (default + ora-nutrition). No dynamic prompt management or database

## Frontend — Widget (widget.js)

Single file, zero dependencies, vanilla JavaScript.

### Initialization

1. Finds itself via `document.currentScript`
2. Reads `data-business`, `data-accent`, `data-welcome` attributes
3. Creates a `<div>` and attaches Shadow DOM
4. Injects all styles (CSS string) and HTML into shadow root

### Configurable attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-business` | `"Assistant"` | Name shown in chat header |
| `data-accent` | `"#6366f1"` | Bubble and header color |
| `data-welcome` | `"How can I help?"` | First bot message |

### Shadow DOM structure

```
Shadow Root
├── <style>              ← All CSS (string in JS)
├── Chat Bubble          ← 56px circle, bottom-right, gradient accent
├── Chat Panel           ← 380x520px, hidden by default
│   ├── Header           ← Business name + close button
│   ├── Messages area    ← Scrollable container
│   │   ├── Bot message  ← Left-aligned, dark background
│   │   └── User message ← Right-aligned, accent color
│   ├── Typing indicator ← 3-dot animation during streaming
│   └── Input bar        ← Text input + Send button
```

### Behavior

- Click bubble → panel slides up (CSS transition)
- Click ✕ or outside panel → panel hides
- Messages stored in JS array (`this.messages = []`)
- On send: full `messages` array posted to server
- Streaming: response read via `fetch` + `ReadableStream`, text appended per chunk
- Enter = send, Shift+Enter = new line
- Escape key closes panel

### Markdown rendering

Built-in lightweight parser. Supports: bold, italic, inline code, code blocks, lists. No external library.

### Mobile responsivity

- Below 480px: panel expands to full screen width
- Bubble stays in same position

## Design theme

- Dark modern theme matching Ora Nutrition
- Accent: `#6366f1` (purple-blue), overridable via `data-accent`
- Secondary accent: `#8b5cf6`
- Bot messages: dark background (`#2a2a3e`), light text
- User messages: accent color background, white text
- Header: gradient using accent colors

## Build phases

Each phase ends with a working state and a git commit on branch `feat/chat-widget`.

| Phase | What gets built | Deliverable |
|-------|----------------|-------------|
| 1. Setup | Scaffold `chat-widget-server/`, `package.json`, `.env`, `.gitignore`, Express with `GET /health` | Server runs, returns `{ status: "ok" }` |
| 2. CORS + Rate limiting | CORS allowlist middleware, `express-rate-limit`, input validation | Server rejects requests from disallowed origins |
| 3. Chat endpoint | `POST /api/chat`, Claude API integration, streaming SSE, system prompts | Testable via curl/Postman — send message, get streaming response |
| 4. Widget bubble | `widget.js` with floating bubble in Shadow DOM, open/close empty panel, served as static file. Test page (`test.html`) | Bubble shows on test page, click opens/closes panel |
| 5. Chat UI | Messages, input, sending, streaming display, typing indicator | Working chat on test page |
| 6. Per-client config | `data-*` attributes — business name, accent color, welcome message | Two different `<script>` tags on test page with different settings |
| 7. UX polish | Animations, markdown rendering, mobile responsivity, Escape key | Fully polished widget |
| 8. Integration | Widget into Next.js app (homepage + wizard), Ora Nutrition system prompt | Widget works on live app |
| 9. Docs | README, embed instructions for clients | Finished product |

## Testing strategy

- **Test page** (`test.html`): plain HTML file served locally, used throughout phases 4-7 to test the widget in isolation
- **curl/Postman**: test backend endpoints directly (phases 2-3)
- **Two-widget test**: in phase 6, test page has two `<script>` tags with different configs to verify isolation
- **Real integration test**: in phase 8, widget on the actual Next.js app
