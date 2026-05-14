import { NextResponse } from "next/server";
import { getProductsByCollection } from "@/lib/shopify-queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const meals = await getProductsByCollection(handle);
  return NextResponse.json(meals);
}
