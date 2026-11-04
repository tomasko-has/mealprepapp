/**
 * Server-side price catalog. The checkout looks up every price here and never
 * trusts prices sent by the browser.
 *
 * TEMPORARY: the data below is a static copy of the Shopify meal export
 * (shopify-products-week2/3.csv) plus placeholder add-ons. When Sanity is
 * connected, replace the body of `getCatalogItems` with a Sanity query —
 * the checkout code only depends on this function's signature.
 */

export type CatalogItemKind = "meal" | "addon";

export interface CatalogItem {
  id: string;
  name: string;
  price: number; // EUR
  kind: CatalogItemKind;
}

const STATIC_CATALOG: CatalogItem[] = [
  { id: "honey-garlic-chicken", name: "Honey Garlic Chicken", price: 12.99, kind: "meal" },
  { id: "baked-cod-lemon-butter", name: "Baked Cod & Lemon Butter", price: 14.99, kind: "meal" },
  { id: "steak-chimichurri", name: "Steak & Chimichurri", price: 15.99, kind: "meal" },
  { id: "pesto-chicken-pasta", name: "Pesto Chicken Pasta", price: 12.99, kind: "meal" },
  { id: "sesame-ginger-salmon", name: "Sesame Ginger Salmon", price: 14.99, kind: "meal" },
  { id: "thai-basil-chicken", name: "Thai Basil Chicken", price: 12.99, kind: "meal" },
  { id: "lamb-kofta-bowl", name: "Lamb Kofta Bowl", price: 13.99, kind: "meal" },
  { id: "keto-salmon-avocado", name: "Keto Salmon & Avocado", price: 15.99, kind: "meal" },
  { id: "mushroom-risotto-chicken", name: "Mushroom Risotto & Chicken", price: 13.99, kind: "meal" },
  { id: "caribbean-jerk-chicken", name: "Caribbean Jerk Chicken", price: 12.99, kind: "meal" },
  { id: "beef-bulgogi-bowl", name: "Beef Bulgogi Bowl", price: 13.99, kind: "meal" },
  { id: "tuscan-chicken", name: "Tuscan Chicken", price: 12.99, kind: "meal" },
  { id: "shrimp-coconut-curry", name: "Shrimp Coconut Curry", price: 14.99, kind: "meal" },
  { id: "keto-chicken-caesar", name: "Keto Chicken Caesar", price: 12.99, kind: "meal" },
  { id: "miso-glazed-chicken", name: "Miso Glazed Chicken", price: 12.99, kind: "meal" },
  { id: "herb-crusted-sea-bass", name: "Herb Crusted Sea Bass", price: 15.99, kind: "meal" },
  { id: "filet-mignon-truffle", name: "Filet Mignon & Truffle", price: 17.99, kind: "meal" },
  { id: "chicken-alfredo", name: "Chicken Alfredo", price: 12.99, kind: "meal" },
  { id: "harissa-salmon-couscous", name: "Harissa Salmon & Couscous", price: 14.99, kind: "meal" },
  { id: "kung-pao-chicken", name: "Kung Pao Chicken", price: 12.99, kind: "meal" },
  { id: "moroccan-lamb-tagine", name: "Moroccan Lamb Tagine", price: 15.99, kind: "meal" },
  { id: "keto-steak-butter", name: "Keto Steak & Herb Butter", price: 16.99, kind: "meal" },
  { id: "sun-dried-tomato-risotto", name: "Sun-Dried Tomato Risotto", price: 13.99, kind: "meal" },
  { id: "blackened-shrimp-tacos", name: "Blackened Shrimp Tacos", price: 13.99, kind: "meal" },
  { id: "korean-fried-chicken", name: "Korean Fried Chicken Bowl", price: 12.99, kind: "meal" },
  { id: "lemon-butter-tilapia", name: "Lemon Butter Tilapia", price: 13.99, kind: "meal" },
  { id: "keto-taco-bowl", name: "Keto Taco Bowl", price: 12.99, kind: "meal" },
  { id: "butter-chicken", name: "Butter Chicken", price: 12.99, kind: "meal" },
  // Placeholder add-ons — the real ones come from Sanity
  { id: "overnight-oats", name: "Overnight Oats", price: 4.99, kind: "addon" },
  { id: "protein-pancakes", name: "Protein Pancakes", price: 5.99, kind: "addon" },
  { id: "protein-bar", name: "Protein Bar", price: 2.99, kind: "addon" },
  { id: "hummus-veggies", name: "Hummus & Veggies", price: 3.99, kind: "addon" },
];

/** Returns the catalog items for the given ids. Unknown ids are simply missing from the map. */
export async function getCatalogItems(ids: string[]): Promise<Map<string, CatalogItem>> {
  const wanted = new Set(ids);
  return new Map(
    STATIC_CATALOG.filter((item) => wanted.has(item.id)).map((item) => [item.id, item])
  );
}
