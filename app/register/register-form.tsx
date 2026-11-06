"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import AuthField from "@/components/auth-field";

export default function RegisterForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="space-y-4">
      <AuthField
        label="Name"
        name="name"
        autoComplete="name"
        defaultValue={state?.fields?.name}
        errors={state?.errors?.name}
      />
      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.fields?.email}
        errors={state?.errors?.email}
      />
      <div>
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          errors={state?.errors?.password}
        />
        {!state?.errors?.password && (
          <p className="mt-1 text-left text-xs text-gray-400">
            At least 8 characters, with a letter and a number.
          </p>
        )}
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="block w-full bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {pending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
