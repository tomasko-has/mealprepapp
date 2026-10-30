// Shared Sanity settings for the Studio, the CLI, the Next.js client and the import script.
// Values come from .env.local (see .env.example). We don't throw when they're missing so that
// `next build` still works on machines without Sanity configured; callers check `isSanityConfigured`.

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Pin the API version to a date so Sanity API changes never break us silently.
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01";

export const isSanityConfigured = projectId.length > 0;
