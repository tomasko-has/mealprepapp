import { cookies } from "next/headers";
import { cancelSubscription } from "@/lib/shopify-customer";
import { refreshAccessToken } from "@/lib/shopify-auth";

export async function POST(request: Request) {
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

  const body = await request.json();
  const { subscriptionContractId } = body;

  if (!subscriptionContractId || typeof subscriptionContractId !== "string") {
    return Response.json(
      { error: "Missing subscriptionContractId" },
      { status: 400 }
    );
  }

  const result = await cancelSubscription(accessToken, subscriptionContractId);

  if (!result.success) {
    return Response.json(
      { error: result.error },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
