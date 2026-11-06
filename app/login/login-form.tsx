"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import AuthField from "@/components/auth-field";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.fields?.email}
        errors={state?.errors?.email}
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        errors={state?.errors?.password}
      />

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="block w-full bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {pending ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
