// Imports the old Shopify CSV exports and lib/data.ts into Sanity.
//
//   npm run sanity:import              # write to the dataset from .env.local
//   npm run sanity:import -- --dry-run # only print what would be created
//
// Safe to run more than once: documents that already exist (same slug, plan type or
// singleton id) are skipped, so edits made in the Studio are never overwritten.

import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SanityClient } from "@sanity/client";
import { PREFERENCE_OPTIONS } from "../../lib/data";
import {
  ABOUT_PAGE,
  ADD_ON_FILES,
  EXTRA_PREFERENCES,
  HOME_PAGE,
  HOW_IT_WORKS_PAGE,
  PLAN_MEAL_COUNTS,
  PLANS,
  SITE_SETTINGS,
  STANDARD_DISCOUNT,
  WEEKS,
} from "./content";

const DATA_DIR = path.join(process.cwd(), "scripts", "sanity-import", "data");
const dryRun = process.argv.includes("--dry-run");

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// --- Helpers --------------------------------------------------------------------------------

/** Minimal RFC 4180 CSV parser: quoted fields may contain commas, newlines and "" escapes. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) rows.push([...row, field]);

  const [header, ...body] = rows.filter((r) => r.some((cell) => cell.trim()));
  return body.map((cells) => Object.fromEntries(header.map((name, i) => [name.trim(), cells[i]?.trim() ?? ""])));
}

function readCsv(file: string) {
  return parseCsv(readFileSync(path.join(DATA_DIR, file), "utf8"));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Same rules as normalizeTag() in lib/shopify-queries.ts: "Low Carbs" -> "low-carb".
function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, "-").replace(/carbs$/, "carb");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const toSlug = (current: string) => ({ _type: "slug", current });
const arrayKey = () => randomUUID().replace(/-/g, "").slice(0, 12);
const reference = (id: string) => ({ _type: "reference", _ref: id, _key: arrayKey() });
const withKeys = <T extends object>(items: T[]) => items.map((item) => ({ _key: arrayKey(), ...item }));
const round2 = (n: number) => Math.round(n * 100) / 100;

// --- Sanity access --------------------------------------------------------------------------

function getClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (dryRun && !projectId) return null;
  if (!projectId || !token) {
    console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local");
    process.exit(1);
  }
  return createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01",
    token,
    useCdn: false,
  });
}

const client = getClient();
// In a dry run the client (if configured) is only used to read what already exists.
const writer = dryRun ? null : client;
const summary: string[] = [];
const report = (label: string, created: number, total: number) =>
  summary.push(`${label}: ${created} ${dryRun ? "would be created" : "created"}, ${total - created} already existed`);

/** Map of key -> existing document _id (published or draft) for one document type. */
async function existingIds(type: string, keyExpr: string): Promise<Map<string, string>> {
  if (!client) return new Map();
  const docs = await client.fetch<{ key: string; _id: string }[]>(
    `*[_type == $type] { "key": ${keyExpr}, _id }`,
    { type },
    { perspective: "raw" },
  );
  // Prefer the published id ("abc") over its draft ("drafts.abc").
  const ids = new Map<string, string>();
  for (const doc of docs) {
    const id = doc._id.replace(/^drafts\./, "");
    if (doc.key && !ids.has(doc.key)) ids.set(doc.key, id);
  }
  return ids;
}

/** Creates the documents whose key is not in Sanity yet. Returns key -> _id for all of them. */
async function upsertByKey(
  type: string,
  keyExpr: string,
  docs: { key: string; doc: Record<string, unknown> }[],
): Promise<Map<string, string>> {
  const ids = await existingIds(type, keyExpr);
  let created = 0;
  for (const { key, doc } of docs) {
    if (ids.has(key)) continue;
    if (writer) {
      const result = await writer.create({ _type: type, ...doc });
      ids.set(key, result._id);
    } else {
      ids.set(key, `dry-run.${type}.${key}`);
    }
    created++;
  }
  report(type, created, docs.length);
  return ids;
}

async function createSingletons(docs: { _id: string; _type: string }[]) {
  let created = 0;
  for (const doc of docs) {
    if (client && (await client.getDocument(doc._id))) continue;
    await writer?.createIfNotExists(doc);
    created++;
  }
  report("singletons", created, docs.length);
}

// --- Import ---------------------------------------------------------------------------------

async function main() {
  console.log(dryRun ? "Dry run: nothing will be written.\n" : "Importing into Sanity...\n");

  // 1. Weekly menu CSVs -> meals (a meal appearing in several weeks is created once).
  const weekRows = WEEKS.map((week) => ({ ...week, rows: readCsv(week.file) }));
  const mealRows = new Map<string, Record<string, string>>();
  for (const week of weekRows) for (const row of week.rows) mealRows.set(row["Handle"], row);

  // 2. Dietary preferences: lib/data.ts + low-carb/keto + any other tag used in the CSVs.
  const preferences = new Map<string, { label: string; description: string }>();
  for (const option of [...PREFERENCE_OPTIONS, ...EXTRA_PREFERENCES]) {
    preferences.set(option.value, { label: option.label, description: option.description });
  }
  for (const row of mealRows.values()) {
    for (const tag of row["Tags"].split(",").filter(Boolean)) {
      const value = normalizeTag(tag);
      if (!preferences.has(value)) preferences.set(value, { label: tag.trim(), description: "" });
    }
  }

  const preferenceIds = await upsertByKey(
    "preference",
    "slug.current",
    [...preferences].map(([value, { label, description }], index) => ({
      key: value,
      doc: { title: label, slug: toSlug(value), description, showInWizard: true, order: index + 1 },
    })),
  );

  const mealIds = await upsertByKey(
    "meal",
    "slug.current",
    [...mealRows.values()].map((row) => ({
      key: row["Handle"],
      doc: {
        name: row["Title"],
        slug: toSlug(row["Handle"]),
        description: stripHtml(row["Body (HTML)"]),
        price: Number(row["Variant Price"]),
        tags: row["Tags"]
          .split(",")
          .filter(Boolean)
          .map((tag) => reference(preferenceIds.get(normalizeTag(tag))!)),
        // Nutrition and ingredients were Shopify metafields and are not in the CSV export.
      },
    })),
  );

  // 3. Weekly menus referencing the meals.
  await upsertByKey(
    "weekCollection",
    "slug.current",
    weekRows.map((week) => ({
      key: week.slug,
      doc: {
        title: week.title,
        slug: toSlug(week.slug),
        weekStart: week.weekStart,
        meals: week.rows.map((row) => reference(mealIds.get(row["Handle"])!)),
      },
    })),
  );

  // 4. Add-ons.
  await upsertByKey(
    "addOn",
    "slug.current",
    ADD_ON_FILES.flatMap(readCsv).map((row) => ({
      key: slugify(row["Title"]),
      doc: {
        name: row["Title"],
        slug: toSlug(slugify(row["Title"])),
        category: row["Type"].toLowerCase() === "breakfast" ? "breakfast" : "snack",
        description: stripHtml(row["Body (HTML)"]),
        price: Number(row["Variant Price"]),
        sku: row["Variant SKU"] || undefined,
      },
    })),
  );

  // 5. Plans. The Shopify plan prices aren't exported, so start from the same formula the
  //    wizard uses as a fallback (lib/pricing.ts): average meal price x meal count, minus
  //    the Standard discount. Review the prices in the Studio.
  const mealPrices = [...mealRows.values()].map((row) => Number(row["Variant Price"]));
  const averageMealPrice = mealPrices.reduce((sum, price) => sum + price, 0) / mealPrices.length;
  await upsertByKey(
    "plan",
    "planType",
    PLANS.map((plan) => {
      const factor = plan.planType === "standard" ? 1 - STANDARD_DISCOUNT : 1;
      return {
        key: plan.planType,
        doc: {
          ...plan,
          badge: plan.badge ?? undefined,
          variants: withKeys(
            PLAN_MEAL_COUNTS.map((mealCount) => ({
              _type: "planVariant",
              mealCount,
              price: round2(averageMealPrice * mealCount * factor),
            })),
          ),
        },
      };
    }),
  );

  // 6. Singletons with fixed ids: site settings and pages.
  const keyed = <T extends Record<string, unknown>>(doc: T): T =>
    JSON.parse(JSON.stringify(doc), (key, value) =>
      Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null)
        ? withKeys(value)
        : value,
    );
  await createSingletons([SITE_SETTINGS, HOME_PAGE, ABOUT_PAGE, HOW_IT_WORKS_PAGE].map(keyed));

  console.log(summary.join("\n"));
  console.log(
    `\n${mealRows.size} meals, ${preferences.size} preferences, average meal price €${round2(averageMealPrice)}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
