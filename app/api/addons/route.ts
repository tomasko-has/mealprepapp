import { NextResponse } from "next/server";
import { getProductsByCollection } from "@/lib/shopify-queries";

export async function GET() {
  const [breakfast, snacks] = await Promise.all([
    getProductsByCollection("add-ons-breakfast"),
    getProductsByCollection("add-ons-snacks"),
  ]);

  return NextResponse.json({ breakfast, snacks });
}
