// Chat route — streams Claude API responses to the client via SSE.
//
// HOW IT WORKS (for the developer):
// 1. The widget sends a POST with { messages, business }.
// 2. We look up the system prompt for that business (see config/prompts.js).
// 3. We open a streaming connection to Claude and forward each text chunk
//    as an SSE "data:" line so the widget can render incrementally.
// 4. When the stream finishes we send "data: [DONE]" to signal completion.

const Anthropic = require("@anthropic-ai/sdk").default;
const { getSystemPrompt } = require("../config/prompts");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function handleChat(req, res) {
  const { messages, business } = req.body;
  const systemPrompt = getSystemPrompt(business || "default");

  // Set SSE headers so the browser treats the response as a stream
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

    // If headers are already sent (stream started), we can only send an
    // error inside the SSE stream. Otherwise return a normal JSON error.
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
