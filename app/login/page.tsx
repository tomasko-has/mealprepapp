import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("shop_access_token")?.value ||
    !!cookieStore.get("shop_refresh_token")?.value;

  if (isLoggedIn) {
    redirect("/account");
  }

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-6">
          Log in to manage your meal plan subscription.
        </p>
        <a
          href="/api/auth/login"
          className="block w-full bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Log In with Shopify
        </a>
        <p className="mt-4 text-xs text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/get-started" className="text-primary hover:underline">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  );
}
