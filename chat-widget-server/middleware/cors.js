/**
 * CORS Allowlist Middleware
 *
 * WHY an allowlist instead of wildcard (*)?
 * -----------------------------------------
 * The chat endpoint is publicly callable from any browser. A wildcard would let
 * any site on the internet make requests to our API on behalf of their visitors.
 * By checking the Origin header against ALLOWED_ORIGINS, we ensure only
 * explicitly approved client domains can reach the server.
 *
 * HOW to add a new client domain:
 * Add the full origin (scheme + host + port) to the ALLOWED_ORIGINS env var,
 * comma-separated.  Example:
 *   ALLOWED_ORIGINS=http://localhost:3000,https://client-site.com
 */

function createCorsMiddleware() {
  // Read the allowlist once at startup from the ALLOWED_ORIGINS env var.
  // Each origin must include the scheme (http/https) and port if non-standard.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return (req, res, next) => {
    const origin = req.headers.origin;

    // Only set CORS headers when the request Origin is on the allowlist.
    // Requests without an Origin header (e.g. same-origin, curl) pass through
    // without any CORS headers — browsers won't treat them as cross-origin.
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight for 24h
    }

    // Handle preflight requests — browsers send OPTIONS before cross-origin
    // POST requests. We respond with 204 No Content (no body needed).
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  };
}

module.exports = { createCorsMiddleware };
