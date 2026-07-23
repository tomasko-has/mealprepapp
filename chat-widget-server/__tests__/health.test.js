process.env.ALLOWED_ORIGINS = "http://localhost:3000";

const request = require("supertest");
const { app } = require("../index");

describe("GET /health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
