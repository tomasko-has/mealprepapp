import { NextResponse } from "next/server";
import { getWeekCollections } from "@/lib/shopify-queries";

export async function GET() {
  const collections = await getWeekCollections();
  return NextResponse.json(collections);
}
