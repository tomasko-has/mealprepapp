# Stripe – nastavenie a lokálne testovanie

Všetko beží v **test mode**: žiadne skutočné peniaze, iba testovacie karty.
`lib/stripe.ts` odmietne iný kľúč než `sk_test_...`.

## 1. Stripe účet a test kľúče

1. Zaregistruj sa na <https://dashboard.stripe.com/register> (stačí e-mail, firemné údaje netreba vypĺňať, kým nechceš prijímať reálne platby).
2. V Dashboarde zapni prepínač **Test mode** (vpravo hore, prípadne „Sandbox“).
3. Choď na **Developers → API keys** a skopíruj:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`, klikni na „Reveal test key“)
4. Do `.env.local` v koreni projektu (nikdy nie do kódu ani do gitu) pridaj:

   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...   # doplníš v kroku 2
   ```

   Vzor je v `.env.example`. Po zmene `.env.local` reštartuj `npm run dev`.

## 2. Webhook lokálne cez Stripe CLI

Stripe posiela udalosti (napr. „platba dokončená“) na `/api/webhook`. Na localhost sa Stripe z internetu nedostane, preto ich preposiela Stripe CLI.

1. Nainštaluj CLI (PowerShell):

   ```powershell
   winget install Stripe.StripeCLI
   ```

   Potom zatvor a znova otvor terminál. Ak `stripe` stále nie je rozpoznaný príkaz (winget niekedy nepridá PATH), spúšťaj ho celou cestou:

   ```powershell
   & "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe" login
   ```

2. Prihlás CLI k účtu (otvorí prehliadač):

   ```powershell
   stripe login
   ```

3. V **samostatnom** termináli spusti preposielanie. Novšie verzie CLI vyžadujú zoznam udalostí cez `--events`:

   ```powershell
   stripe listen --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed --forward-to localhost:3000/api/webhook
   ```

   Vypíše `Your webhook signing secret is whsec_...` – tento kľúč daj do `.env.local` ako `STRIPE_WEBHOOK_SECRET` a reštartuj `npm run dev`. Terminál so `stripe listen` nechaj bežať.

4. Rýchly test bez nákupu:

   ```powershell
   stripe trigger checkout.session.completed
   ```

   V termináli s `stripe listen` uvidíš `[200] POST http://localhost:3000/api/webhook` a v termináli s `npm run dev` riadok `[stripe] checkout completed`.

## 3. Customer Portal (správa predplatného)

Raz ho aktivuj: Dashboard (Test mode) → **Settings → Billing → Customer portal** → **Activate test link** / Save.
Funkcia `createCustomerPortalSession()` v `lib/stripe.ts` je pripravená; na account stránku ju napojí auth session.

## 4. Test celého nákupu

1. `npm run dev` + `stripe listen ...` (dva terminály).
2. Prejdi wizard → menu → add-ony → `/menu/summary`, zaškrtni súhlas a klikni **Proceed to Checkout**.

   **Kým menu nie je napojené na Sanity** (Shopify nevracia jedlá), vlož testovaciu objednávku ručne: otvor `http://localhost:3000`, DevTools (F12) → Console, vlož a spusti:

   ```js
   const meal = (id, name, price) => ({ id, name, price, description: "", tags: [], calories: 0, protein: 0, carbs: 0, fat: 0, ingredients: [], image: "" });
   localStorage.setItem("orderData", JSON.stringify({
     planType: "standard", mealsPerDay: 1, daysPerWeek: 5,
     selectedMeals: [
       { meal: meal("honey-garlic-chicken", "Honey Garlic Chicken", 12.99), quantity: 3 },
       { meal: meal("steak-chimichurri", "Steak & Chimichurri", 15.99), quantity: 2 },
     ],
     selectedAddOns: [{ meal: meal("protein-bar", "Protein Bar", 2.99), quantity: 2 }],
   }));
   location.href = "/menu/summary";
   ```

   Očakávaná suma: jedlá €70.95 − 20 % (€14.19) = €56.76, add-ony €5.98, spolu **€62.74 týždenne**. Rovnakú sumu musí ukázať aj Stripe.
3. Na Stripe stránke zadaj testovaciu kartu:
   - úspešná platba: `4242 4242 4242 4242`
   - 3D Secure overenie: `4000 0025 0000 3155`
   - zamietnutá karta: `4000 0000 0000 0002`

   Dátum ľubovoľný v budúcnosti (napr. `12/34`), CVC ľubovoľné 3 čísla, e-mail a meno ľubovoľné.
4. Po platbe ťa Stripe vráti na `/order-confirmation`. V DevTools → Application → Local Storage majú zmiznúť `orderData` a `wizardSelections`.
5. V `stripe listen` uvidíš `checkout.session.completed`, `customer.subscription.created` a `invoice.paid`, všetky so stavom `[200]`.
6. V Dashboarde → **Billing → Subscriptions** uvidíš nové týždenné predplatné.
7. Zrušenie: na Stripe stránke klikni šípku späť → vrátiš sa na `/menu/summary` s hláškou a košík ostane.

### Test opakovanej platby (ďalší týždeň)

Nemusíš čakať týždeň. Stripe má na to **test clocks** („simulované hodiny“): vytvoríš zákazníka s predplatným naviazaným na test clock a čas posunieš o týždeň dopredu. Návod: <https://docs.stripe.com/billing/testing/test-clocks>. Stripe vystaví ďalšiu faktúru a webhook dostane `invoice.paid` s `billing_reason: subscription_cycle`. Pre prvé overenie to nie je nutné.

## Ako to funguje

- Prehliadač posiela na `/api/checkout` iba **ID jedál a počty**, nikdy ceny.
- Server si ceny nájde v `lib/catalog.ts` (dočasné statické dáta, neskôr Sanity) a spočíta ich cez `calculateOrderTotals()` v `lib/pricing.ts`. Zľavu Standard plánu aplikuje presne raz.
- `lib/checkout.ts` vytvorí Checkout Session v režime `subscription` (týždenná platba). Objednávka sa uloží do `metadata` session aj predplatného.
- `/api/webhook` overí podpis (`STRIPE_WEBHOOK_SECRET`) a udalosti spracuje v `lib/stripe-webhook.ts` (zatiaľ iba logovanie, databáza ešte nie je).
- `/order-confirmation` si session overí priamo u Stripe a až potom vyčistí localStorage.
