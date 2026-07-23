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
