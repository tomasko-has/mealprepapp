import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN!;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";

export const shopifyClient = createStorefrontApiClient({
  storeDomain: `https://${domain}`,
  apiVersion,
  privateAccessToken: privateToken,
});
