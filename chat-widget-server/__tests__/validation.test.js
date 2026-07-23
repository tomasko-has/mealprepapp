process.env.ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:5500";

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
