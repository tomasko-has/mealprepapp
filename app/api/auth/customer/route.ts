import { cookies } from "next/headers";
import { getCustomerProfile, getCustomerOrders } from "@/lib/shopify-customer";
import { refreshAccessToken } from "@/lib/shopify-auth";

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("shop_access_token")?.value;
  const refreshToken = cookieStore.get("shop_refresh_token")?.value;

  if (!accessToken && refreshToken) {
    try {
      const tokens = await refreshAccessToken(refreshToken);
      accessToken = tokens.access_token;
    } catch {
      return Response.json({ error: "Session expired" }, { status: 401 });
    }
  }

  if (!accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [profile, orders] = await Promise.all([
    getCustomerProfile(accessToken),
    getCustomerOrders(accessToken),
  ]);

  if (!profile) {
    return Response.json({ error: "Failed to fetch customer data" }, { status: 500 });
  }

  return Response.json({ profile, orders });
}
