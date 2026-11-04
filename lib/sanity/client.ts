import { createClient, type QueryParams, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

let client: SanityClient | null = null;

// Created on first use: createClient() throws without a projectId, and we don't want a
// missing .env.local to crash the build of pages that don't need Sanity.
function getClient(): SanityClient {
  client ??= createClient({
    projectId,
    dataset,
    apiVersion,
    // CDN = fast cached reads of published content.
    useCdn: true,
    perspective: "published",
    // Only needed when the dataset is private.
    token: process.env.SANITY_API_READ_TOKEN,
  });
  return client;
}

// How long Next.js caches Sanity responses (seconds). Content edits show up after this
// at the latest; the tags allow on-demand revalidation via a webhook later.
const REVALIDATE_SECONDS = 60;

/**
 * Runs a GROQ query. Like the old Shopify helpers it never throws:
 * on a missing config or API error it logs and returns `fallback`.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  fallback,
}: {
  query: string;
  params?: QueryParams;
  tags: string[];
  fallback: T;
}): Promise<T> {
  if (!isSanityConfigured) {
    console.error("Sanity is not configured: set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
    return fallback;
  }

  try {
    const result = await getClient().fetch<T | null>(query, params, {
      next: { revalidate: REVALIDATE_SECONDS, tags },
    });
    return result ?? fallback;
  } catch (error) {
    console.error("Sanity API error:", error);
    return fallback;
  }
}
