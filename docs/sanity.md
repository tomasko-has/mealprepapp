# Sanity: obsah a produkty

Sanity spravuje jedlá, týždenné menu, plány, add-ony, nastavenia webu a texty stránok.
Studio je vložené priamo v Next.js appke na **`/studio`**.

## Setup

1. Na <https://www.sanity.io/manage> vytvor projekt (dataset `production`, public).
2. **API → CORS origins**: pridaj `http://localhost:3000` (a neskôr produkčnú doménu) so zaškrtnutým **Allow credentials**.
3. **API → Tokens**: vytvor token s oprávnením **Editor** (len pre import skript).
4. Do `.env.local` doplň:

   ```bash
   # Project ID zo sanity.io/manage
   NEXT_PUBLIC_SANITY_PROJECT_ID=
   # Názov datasetu
   NEXT_PUBLIC_SANITY_DATASET=production
   # Voliteľné: verzia Sanity API (default 2026-10-01)
   # NEXT_PUBLIC_SANITY_API_VERSION=2026-10-01
   # Voliteľné: len pre privátny dataset, token s oprávnením Viewer
   # SANITY_API_READ_TOKEN=
   # Len pre import skript, token s oprávnením Editor
   SANITY_API_WRITE_TOKEN=
   ```

5. `npm run dev` a otvor <http://localhost:3000/studio>.

## Skripty

| Príkaz | Čo robí |
|---|---|
| `npm run sanity:import -- --dry-run` | Ukáže, čo by import vytvoril (nič nezapisuje). |
| `npm run sanity:import` | Naplní Sanity z `scripts/sanity-import/data/*.csv`, `lib/data.ts` a textov zo súčasných komponentov. Existujúce dokumenty preskočí, takže úpravy zo Studia neprepíše. |
| `npm run sanity:check` | Zavolá všetky query funkcie a vypíše, čo vrátili. |

## Dátový model (`sanity/schemaTypes/`)

| Typ | Popis |
|---|---|
| `meal` | Jedlo: názov, slug, popis, fotka, cena, kcal/bielkoviny/sacharidy/tuky, tagy (referencie na `preference`), ingrediencie |
| `preference` | Diétny tag / preferencia vo wizarde (High Protein, Keto, …) |
| `weekCollection` | Týždenné menu: názov, slug, začiatok týždňa, referencie na jedlá |
| `plan` | Standard / Flexible, popis, výhody, **finálna** cena za každý počet jedál |
| `addOn` | Raňajky / snack s cenou a nutričnými hodnotami |
| `siteSettings` | Singleton: názov firmy, logo, farby, kontakt, dni rozvozu |
| `homePage`, `aboutPage`, `howItWorksPage` | Singletony s textami stránok (hero, kroky, hodnoty, FAQ, CTA) |

## Query funkcie (`lib/sanity/queries.ts`)

Vracajú typy z `lib/types.ts`, takže sa dajú vymeniť za Shopify funkcie:

| Shopify (`lib/shopify-queries.ts`) | Sanity (`lib/sanity/queries.ts`) |
|---|---|
| `getProducts()` | `getMeals()` |
| `getProductByHandle(handle)` | `getMealBySlug(slug)` |
| `getWeekCollections()` | `getWeekCollections()` (+ `startDate`) |
| `getProductsByCollection("week-…")` | `(await getWeekMenu(slug))?.meals` alebo `getCurrentWeekMenu()` |
| `getProductsByCollection("add-ons-…")` | `getAddOns()` a filter podľa `category` |
| `getPlanProducts()` + `/api/plans` | `getPlans()`, `getPlanPricing()` |
| `getShopName()` | `(await getSiteSettings())?.companyName` |
| `PREFERENCE_OPTIONS` (`lib/data.ts`) | `getPreferences()` |
| natvrdo v komponentoch | `getHomePage()`, `getAboutPage()`, `getHowItWorksPage()` |

Pozor: ceny plánov v Sanity sú **finálne**. Pri prepájaní wizardu (#11) už na ne neaplikuj
`STANDARD_DISCOUNT`, inak vznikne dvojitá zľava.

Odpovede sa cachujú 60 s (`lib/sanity/client.ts`) s tagmi podľa typu dokumentu
(`meal`, `plan`, …), takže neskôr stačí webhook, ktorý zavolá `revalidateTag`.

## Čo v dátach chýba (doplniť v Studiu)

- **Nutričné hodnoty a ingrediencie** jedál a add-onov: boli v Shopify metafieldoch, CSV export ich nemá. Studio ich ukazuje ako varovanie.
- **Fotky** jedál a hero obrázok: CSV nemá obrázky.
- **Ceny plánov** sú dočasne vypočítané vzorcom z `lib/pricing.ts` (priemerná cena jedla × počet jedál, Standard −20 %).
- **Dátumy týždňov** sú nastavené od 26. 10. 2026 po týždňoch.
- **Kontakt** v Site settings a popisy preferencií Low Carb a Keto.
