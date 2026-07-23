(function () {
  "use strict";

  const scriptTag = document.currentScript;
  const serverUrl = scriptTag.src.replace(/\/public\/widget\.js$/, "");

  const config = {
    business: scriptTag.getAttribute("data-business") || "Assistant",
    accent: scriptTag.getAttribute("data-accent") || "#6366f1",
    welcome: scriptTag.getAttribute("data-welcome") || "How can I help you today?",
  };

  const host = document.createElement("div");
  host.id = "chat-widget-host";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "closed" });

  // Compute darker accent for hover
  function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
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

  // ALL CSS (inside shadow DOM — isolated from host page)
  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .widget-bubble {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${config.accent}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 2147483647;
      transition: transform 0.2s ease, background 0.2s ease;
    }
    .widget-bubble:hover { transform: scale(1.08); background: ${accentHover}; }
    .widget-bubble svg { width: 26px; height: 26px; fill: white; }
    .widget-bubble.open svg.icon-chat { display: none; }
    .widget-bubble.open svg.icon-close { display: block; }
    .widget-bubble:not(.open) svg.icon-chat { display: block; }
    .widget-bubble:not(.open) svg.icon-close { display: none; }

    .widget-panel {
      position: fixed; bottom: 96px; right: 24px;
      width: 380px; height: 520px; border-radius: 16px;
      overflow: hidden; display: flex; flex-direction: column;
      background: #1e1e2e;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      z-index: 2147483646;
      opacity: 0; transform: translateY(16px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .widget-panel.open {
      opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
    }

    .widget-header {
      background: linear-gradient(135deg, ${config.accent}, ${config.accent}cc);
      padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;
    }
    .widget-header-title {
      color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 15px; font-weight: 600;
    }
    .widget-header-close {
      background: none; border: none; color: white; font-size: 20px;
      cursor: pointer; padding: 0 4px; opacity: 0.8; transition: opacity 0.15s;
    }
    .widget-header-close:hover { opacity: 1; }

    .widget-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px; line-height: 1.5; color: #e2e8f0;
    }
    .widget-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; word-wrap: break-word; }
    .widget-msg.bot { align-self: flex-start; background: #2a2a3e; border-bottom-left-radius: 4px; }
    .widget-msg.user { align-self: flex-end; background: ${config.accent}; color: white; border-bottom-right-radius: 4px; }

    .widget-typing {
      align-self: flex-start; padding: 10px 14px; background: #2a2a3e;
      border-radius: 12px; border-bottom-left-radius: 4px; display: none;
    }
    .widget-typing.visible { display: flex; gap: 4px; align-items: center; }
    .widget-typing-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;
      animation: typing-bounce 1.2s infinite;
    }
    .widget-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .widget-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }

    .widget-input-bar { padding: 12px; border-top: 1px solid #2a2a3e; display: flex; gap: 8px; }
    .widget-input {
      flex: 1; background: #2a2a3e; border: 1px solid #3a3a4e; border-radius: 8px;
      padding: 10px 14px; color: #e2e8f0; font-family: inherit; font-size: 14px;
      outline: none; resize: none; min-height: 40px; max-height: 100px;
    }
    .widget-input:focus { border-color: ${config.accent}; }
    .widget-input::placeholder { color: #64748b; }
    .widget-send {
      background: ${config.accent}; border: none; border-radius: 8px; color: white;
      padding: 10px 16px; font-size: 14px; font-weight: 500; cursor: pointer;
      white-space: nowrap; transition: background 0.15s;
    }
    .widget-send:hover { background: ${accentHover}; }
    .widget-send:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 480px) {
      .widget-panel {
        width: calc(100vw - 16px); height: calc(100vh - 120px);
        right: 8px; bottom: 88px; border-radius: 12px;
      }
    }
  `;

  // HTML structure
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
  const messagesEl = shadow.querySelector(".widget-messages");
  const inputEl = shadow.querySelector(".widget-input");
  const sendBtn = shadow.querySelector(".widget-send");

  // Typing indicator
  const typingEl = document.createElement("div");
  typingEl.className = "widget-typing";
  typingEl.innerHTML = `
    <div class="widget-typing-dot"></div>
    <div class="widget-typing-dot"></div>
    <div class="widget-typing-dot"></div>
  `;
  messagesEl.appendChild(typingEl);

  // State
  let isOpen = false;
  let welcomed = false;
  const messages = [];
  let isStreaming = false;

  // Toggle panel
  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
    bubble.classList.toggle("open", isOpen);
    if (isOpen && !welcomed) {
      welcomed = true;
      appendMessage("bot", config.welcome);
    }
    if (isOpen) inputEl.focus();
  }

  bubble.addEventListener("click", togglePanel);
  closeBtn.addEventListener("click", togglePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) togglePanel();
  });

  // Lightweight markdown parser
  function renderMarkdown(text) {
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

  // Append message to UI
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

  // Input handling
  inputEl.addEventListener("input", () => {
    sendBtn.disabled = inputEl.value.trim().length === 0 || isStreaming;
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + "px";
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // Send message and stream response
  async function sendMessage() {
    const content = inputEl.value.trim();
    if (!content || isStreaming) return;

    appendMessage("user", content);
    messages.push({ role: "user", content });

    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;
    isStreaming = true;

    typingEl.classList.add("visible");
    messagesEl.scrollTop = messagesEl.scrollHeight;

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

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
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
            // Skip malformed chunks
          }
        }
      }
    } catch (error) {
      fullResponse = "Sorry, something went wrong. Please try again.";
      botMsgEl.textContent = fullResponse;
    }

    // Render final response with markdown
    botMsgEl.innerHTML = renderMarkdown(fullResponse);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    typingEl.classList.remove("visible");
    messages.push({ role: "assistant", content: fullResponse });
    isStreaming = false;
    sendBtn.disabled = inputEl.value.trim().length === 0;
  }
})();
