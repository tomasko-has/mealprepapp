import { shopifyClient } from "./shopify";
import type { Meal, MealCategory } from "./types";

const PRODUCTS_QUERY = `#graphql
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          title
          description
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
          category: metafield(namespace: "custom", key: "category") {
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

interface ShopifyProduct {
  handle: string;
  title: string;
  description: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  calories: { value: string } | null;
  protein: { value: string } | null;
  carbs: { value: string } | null;
  fat: { value: string } | null;
  category: { value: string } | null;
  ingredients: { value: string } | null;
}

function shopifyProductToMeal(product: ShopifyProduct): Meal {
  return {
    id: product.handle,
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url ?? "",
    calories: parseInt(product.calories?.value ?? "0", 10),
    protein: parseInt(product.protein?.value ?? "0", 10),
    carbs: parseInt(product.carbs?.value ?? "0", 10),
    fat: parseInt(product.fat?.value ?? "0", 10),
    category: (product.category?.value ?? "healthy") as MealCategory,
    ingredients: product.ingredients?.value
      ? product.ingredients.value.split(",").map((s) => s.trim())
      : [],
  };
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
