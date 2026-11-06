import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";
import LoginForm from "./login-form";

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/account");
  }

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-6">
          Log in to manage your meal plan subscription.
        </p>
        <LoginForm />
        <p className="mt-4 text-xs text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
