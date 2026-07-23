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
