import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

function createDb(url: string) {
  return drizzle({ client: neon(url), schema });
}

let db: Db | null = null;

// The client is created on first use, not on import. That way a missing
// DATABASE_URL does not break `next build` (e.g. a Vercel preview without secrets);
// it only fails when a request actually needs the database.
export function getDb(): Db {
  if (db) return db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }

  db = createDb(url);
  return db;
}
