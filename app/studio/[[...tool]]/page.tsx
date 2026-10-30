// Embedded Sanity Studio. The optional catch-all segment lets the Studio handle
// its own sub-routes (/studio, /studio/structure/meal, ...).

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  // The root layout renders the site navbar and footer around every page.
  // A fixed full-screen wrapper lets the Studio cover them without touching the layout.
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "white" }}>
      {isSanityConfigured ? (
        <NextStudio config={config} />
      ) : (
        <p style={{ padding: 32, fontFamily: "sans-serif" }}>
          Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in
          .env.local (see docs/sanity.md) and restart the dev server.
        </p>
      )}
    </div>
  );
}
