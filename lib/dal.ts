import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

// Optimistic check: only reads the signed cookie, no database call.
// Good enough for UI decisions like showing "Login" vs "My Account".
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
});

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});

// Secure check: the user must still exist in the database.
// Returns only the fields the UI needs (never the password hash).
export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  const [user] = await getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
});
