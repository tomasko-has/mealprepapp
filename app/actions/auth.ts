"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, deleteSession } from "@/lib/session";
import { LoginFormSchema, SignupFormSchema, type FormState } from "@/lib/auth-definitions";

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      fields: { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") },
    };
  }

  const { name, email, password } = parsed.data;
  const db = getDb();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { errors: { email: ["An account with this email already exists."] }, fields: { name, email } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id });

  if (!user) {
    return { message: "Something went wrong while creating your account.", fields: { name, email } };
  }

  await createSession(user.id);
  // redirect() throws internally, so it must stay outside any try/catch
  redirect("/account");
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      fields: { email: String(formData.get("email") ?? "") },
    };
  }

  const { email, password } = parsed.data;

  const [user] = await getDb()
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Same message for "no such user" and "wrong password", so the form
  // does not reveal which emails have an account
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { message: "Invalid email or password.", fields: { email } };
  }

  await createSession(user.id);
  redirect("/account");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
