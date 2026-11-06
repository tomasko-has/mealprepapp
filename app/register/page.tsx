import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  if (await getSession()) {
    redirect("/account");
  }

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign up to manage your meal plan and orders.
        </p>
        <RegisterForm />
        <p className="mt-4 text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
