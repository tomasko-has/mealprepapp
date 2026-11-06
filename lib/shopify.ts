import {
  createStorefrontApiClient,
  type StorefrontApiClient,
} from "@shopify/storefront-api-client";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";

// createStorefrontApiClient throws at import time when the token is missing,
// which breaks the whole build (the root layout imports Shopify queries).
// Without env vars, fall back to a stub whose requests return an error —
// every query already handles `errors` by returning empty data.
const notConfiguredClient = {
  request: async () => ({
    data: undefined,
    errors: { message: "Shopify is not configured (missing env vars)" },
  }),
} as unknown as StorefrontApiClient;

export const shopifyClient: StorefrontApiClient =
  domain && privateToken
    ? createStorefrontApiClient({
        storeDomain: `https://${domain}`,
        apiVersion,
        privateAccessToken: privateToken,
      })
    : notConfiguredClient;
