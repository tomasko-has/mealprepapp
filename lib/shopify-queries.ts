import { shopifyClient } from "./shopify";
import type { Meal } from "./types";

const PRODUCTS_QUERY = `#graphql
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          title
          description
          tags
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          calories: metafield(namespace: "custom", key: "calories") {
            value
          }
          protein: metafield(namespace: "custom", key: "protein") {
            value
          }
          carbs: metafield(namespace: "custom", key: "carbs") {
            value
          }
          fat: metafield(namespace: "custom", key: "fat") {
            value
          }
          ingredients: metafield(namespace: "custom", key: "ingredients") {
            value
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      handle
      title
      description
      tags
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      calories: metafield(namespace: "custom", key: "calories") {
        value
      }
      protein: metafield(namespace: "custom", key: "protein") {
        value
      }
      carbs: metafield(namespace: "custom", key: "carbs") {
        value
      }
      fat: metafield(namespace: "custom", key: "fat") {
        value
      }
      ingredients: metafield(namespace: "custom", key: "ingredients") {
        value
      }
      detailedDescription: metafield(namespace: "custom", key: "detailed_description") {
        value
      }
    }
  }
`;

interface ShopifyProduct {
  handle: string;
  title: string;
  description: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  calories: { value: string } | null;
  protein: { value: string } | null;
  carbs: { value: string } | null;
  fat: { value: string } | null;
  ingredients: { value: string } | null;
  detailedDescription: { value: string } | null;
}

function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/carbs$/, "carb");
}

function shopifyProductToMeal(product: ShopifyProduct): Meal {
  return {
    id: product.handle,
    name: product.title,
    description: product.description,
    detailedDescription: product.detailedDescription?.value ?? "",
    image: product.featuredImage?.url ?? "",
    tags: product.tags.map(normalizeTag),
    calories: parseInt(product.calories?.value ?? "0", 10),
    protein: parseInt(product.protein?.value ?? "0", 10),
    carbs: parseInt(product.carbs?.value ?? "0", 10),
    fat: parseInt(product.fat?.value ?? "0", 10),
    ingredients: product.ingredients?.value
      ? product.ingredients.value.split(",").map((s) => s.trim())
      : [],
    price: parseFloat(product.priceRange.minVariantPrice.amount),
  };
}

const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query GetCollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      title
      products(first: $first) {
        edges {
          node {
            handle
            title
            description
            tags
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            calories: metafield(namespace: "custom", key: "calories") {
              value
            }
            protein: metafield(namespace: "custom", key: "protein") {
              value
            }
            carbs: metafield(namespace: "custom", key: "carbs") {
              value
            }
            fat: metafield(namespace: "custom", key: "fat") {
              value
            }
            ingredients: metafield(namespace: "custom", key: "ingredients") {
              value
            }
          }
        }
      }
    }
  }
`;

const WEEK_COLLECTIONS_QUERY = `#graphql
  query GetWeekCollections($first: Int!, $query: String!) {
    collections(first: $first, query: $query) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

const SHOP_QUERY = `#graphql
  query GetShop {
    shop {
      name
    }
  }
`;

export async function getShopName(): Promise<string> {
  const { data, errors } = await shopifyClient.request(SHOP_QUERY);

  if (errors) {
    console.error("Shopify API errors:", errors);
    return "ORA";
  }

  return data?.shop?.name ?? "ORA";
}

export async function getProducts(first = 20): Promise<Meal[]> {
  const { data, errors } = await shopifyClient.request(PRODUCTS_QUERY, {
    variables: { first },
  });

  if (errors) {
    console.error("Shopify API errors:", errors);
    return [];
  }

  const edges = data?.products?.edges ?? [];
  return edges.map((edge: { node: ShopifyProduct }) =>
    shopifyProductToMeal(edge.node)
  );
}

export async function getWeekCollections(): Promise<{ handle: string; title: string }[]> {
  const { data, errors } = await shopifyClient.request(WEEK_COLLECTIONS_QUERY, {
    variables: { first: 10, query: "title:week-*" },
  });

  if (errors) {
    console.error("Shopify API errors:", errors);
    return [];
  }

  const edges = data?.collections?.edges ?? [];
  return edges
    .map((edge: { node: { handle: string; title: string } }) => ({
      handle: edge.node.handle,
      title: edge.node.title,
    }))
    .sort((a: { handle: string }, b: { handle: string }) => a.handle.localeCompare(b.handle));
}

export async function getProductsByCollection(handle: string, first = 20): Promise<Meal[]> {
  const { data, errors } = await shopifyClient.request(COLLECTION_BY_HANDLE_QUERY, {
    variables: { handle, first },
  });

  if (errors) {
    console.error("Shopify API errors:", errors);
    return [];
  }

  const edges = data?.collection?.products?.edges ?? [];
  return edges.map((edge: { node: ShopifyProduct }) =>
    shopifyProductToMeal(edge.node)
  );
}

export async function getProductByHandle(handle: string): Promise<Meal | null> {
  const { data, errors } = await shopifyClient.request(PRODUCT_BY_HANDLE_QUERY, {
    variables: { handle },
  });

  if (errors) {
    console.error("Shopify API errors:", errors);
    return null;
  }

  const product = data?.productByHandle;
  if (!product) return null;

  return shopifyProductToMeal(product);
}
