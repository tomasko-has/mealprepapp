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
