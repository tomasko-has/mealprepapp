# ORA Nutrition Meal Prep Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ORA Nutrition meal prep subscription website with home page, multi-step get-started wizard, weekly menu browser, and meal selection flow — everything except checkout/payment.

**Architecture:** Next.js 16 App Router with Tailwind CSS 4. Pages are server components, interactive widgets (wizard, meal picker) are client components. All data is hardcoded/mock — no backend. State management via React useState/useReducer within client components.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4

**Visual Style:** Clean white backgrounds, emerald-green primary accent (#059669), dark headings, rounded cards with subtle shadows, large food imagery (placeholder colored divs with icons until real photos). Inspired by Factor75.com layout patterns.

---

## File Structure

```
app/
  layout.tsx              — Root layout with Navbar + Footer
  page.tsx                — Home page (Hero, How It Works, Meal Preview, CTA)
  globals.css             — Tailwind imports + custom CSS variables
  get-started/
    page.tsx              — Multi-step wizard (client component)
  menu/
    page.tsx              — Weekly menu browser with 3-week preview
components/
  navbar.tsx              — Top navigation bar
  footer.tsx              — Site footer
  hero.tsx                — Hero section with CTA
  how-it-works.tsx        — 4-step visual explainer
  meal-card.tsx           — Reusable meal card (photo, macros, ingredients)
  meal-preview.tsx        — Home page meal showcase section
  plan-selection.tsx      — Standard vs Flexible plan cards
  meal-picker.tsx         — Flexible plan meal selector with progress (client)
  add-ons.tsx             — Breakfast & snack add-ons (client)
  step-indicator.tsx      — Wizard progress indicator
lib/
  data.ts                 — All mock data (meals, plans, prices, categories)
  types.ts                — TypeScript interfaces
```

---

### Task 1: Types and Mock Data

**Files:**
- Create: `lib/types.ts`
- Create: `lib/data.ts`

- [ ] **Step 1: Create TypeScript interfaces**

Create `lib/types.ts`:

```ts
export interface Meal {
  id: string;
  name: string;
  description: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  image: string; // placeholder path
}

export type MealCategory = "calorie-smart" | "high-protein" | "gluten-free" | "healthy";

export type Goal = "improve-health" | "weight-loss" | "muscle-gain" | "save-time";

export type MealPreference = MealCategory;

export type AvoidIngredient = "tuna" | "pork";

export type MealsPerDay = 1 | 2 | 3;

export type DaysPerWeek = 5 | 6 | 7;

export type PlanType = "standard" | "flexible";

export interface UserSelections {
  goals: Goal[];
  preferences: MealPreference[];
  avoid: AvoidIngredient[];
  mealsPerDay: MealsPerDay | null;
  daysPerWeek: DaysPerWeek | null;
  planType: PlanType | null;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "breakfast" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeekMenu {
  weekLabel: string;
  startDate: string;
  meals: Meal[];
}
```

- [ ] **Step 2: Create mock data**

Create `lib/data.ts`:

```ts
import { Meal, AddOn, WeekMenu } from "./types";

export const MEALS: Meal[] = [
  {
    id: "m1",
    name: "Grilled Chicken & Sweet Potato",
    description: "Tender grilled chicken breast with roasted sweet potato and steamed broccoli.",
    category: "high-protein",
    calories: 450,
    protein: 42,
    carbs: 35,
    fat: 12,
    ingredients: ["chicken breast", "sweet potato", "broccoli", "olive oil", "garlic", "paprika"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m2",
    name: "Salmon Teriyaki Bowl",
    description: "Pan-seared salmon with teriyaki glaze, jasmine rice, and edamame.",
    category: "healthy",
    calories: 520,
    protein: 38,
    carbs: 45,
    fat: 18,
    ingredients: ["salmon", "jasmine rice", "edamame", "teriyaki sauce", "sesame seeds", "green onion"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m3",
    name: "Turkey Meatball Marinara",
    description: "Lean turkey meatballs in house-made marinara with zucchini noodles.",
    category: "calorie-smart",
    calories: 380,
    protein: 35,
    carbs: 22,
    fat: 14,
    ingredients: ["turkey", "zucchini", "tomato sauce", "garlic", "basil", "parmesan"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m4",
    name: "Beef Stir-Fry",
    description: "Sliced beef with bell peppers, snap peas, and ginger soy sauce over brown rice.",
    category: "high-protein",
    calories: 510,
    protein: 40,
    carbs: 42,
    fat: 16,
    ingredients: ["beef sirloin", "bell peppers", "snap peas", "brown rice", "soy sauce", "ginger"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m5",
    name: "Mediterranean Chicken Bowl",
    description: "Herb-marinated chicken with quinoa, cucumbers, tomatoes, and tzatziki.",
    category: "healthy",
    calories: 470,
    protein: 38,
    carbs: 38,
    fat: 15,
    ingredients: ["chicken thigh", "quinoa", "cucumber", "tomato", "red onion", "tzatziki"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m6",
    name: "Shrimp & Cauliflower Rice",
    description: "Garlic butter shrimp with cauliflower rice and roasted asparagus.",
    category: "calorie-smart",
    calories: 320,
    protein: 30,
    carbs: 15,
    fat: 14,
    ingredients: ["shrimp", "cauliflower", "asparagus", "butter", "garlic", "lemon"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m7",
    name: "Chicken Fajita Bowl",
    description: "Spiced chicken with black beans, corn, peppers, and cilantro lime rice.",
    category: "high-protein",
    calories: 490,
    protein: 40,
    carbs: 44,
    fat: 14,
    ingredients: ["chicken breast", "black beans", "corn", "bell peppers", "rice", "lime"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m8",
    name: "Herb Crusted Cod",
    description: "Baked cod with herb crust, mashed potatoes, and green beans.",
    category: "gluten-free",
    calories: 390,
    protein: 34,
    carbs: 30,
    fat: 12,
    ingredients: ["cod", "potatoes", "green beans", "herbs", "olive oil", "lemon"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m9",
    name: "BBQ Chicken & Coleslaw",
    description: "Smoky BBQ pulled chicken with creamy coleslaw and cornbread.",
    category: "high-protein",
    calories: 480,
    protein: 36,
    carbs: 40,
    fat: 16,
    ingredients: ["chicken breast", "bbq sauce", "cabbage", "carrot", "cornbread", "mayo"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m10",
    name: "Veggie Stir-Fry & Tofu",
    description: "Crispy tofu with mixed vegetables in a ginger sesame sauce over rice noodles.",
    category: "calorie-smart",
    calories: 360,
    protein: 22,
    carbs: 38,
    fat: 14,
    ingredients: ["tofu", "broccoli", "carrots", "mushrooms", "rice noodles", "sesame oil"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m11",
    name: "Lamb Kofta & Hummus",
    description: "Spiced lamb kofta with creamy hummus, tabbouleh, and warm pita.",
    category: "healthy",
    calories: 530,
    protein: 36,
    carbs: 40,
    fat: 22,
    ingredients: ["lamb", "chickpeas", "parsley", "bulgur", "tahini", "pita"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m12",
    name: "Chicken Caesar Wrap",
    description: "Grilled chicken with romaine, parmesan, and caesar dressing in a GF wrap.",
    category: "gluten-free",
    calories: 420,
    protein: 35,
    carbs: 28,
    fat: 18,
    ingredients: ["chicken breast", "romaine", "parmesan", "gf wrap", "caesar dressing"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m13",
    name: "Thai Green Curry Chicken",
    description: "Chicken in coconut green curry with jasmine rice and Thai basil.",
    category: "healthy",
    calories: 500,
    protein: 34,
    carbs: 44,
    fat: 20,
    ingredients: ["chicken thigh", "coconut milk", "green curry paste", "jasmine rice", "thai basil", "bamboo shoots"],
    image: "/meals/placeholder.jpg",
  },
  {
    id: "m14",
    name: "Steak & Roasted Vegetables",
    description: "Seared sirloin steak with roasted root vegetables and chimichurri.",
    category: "high-protein",
    calories: 540,
    protein: 44,
    carbs: 28,
    fat: 24,
    ingredients: ["sirloin steak", "sweet potato", "carrots", "parsnip", "chimichurri", "olive oil"],
    image: "/meals/placeholder.jpg",
  },
];

export const ADD_ONS: AddOn[] = [
  {
    id: "b1",
    name: "Protein Pancakes",
    description: "Fluffy protein pancakes with mixed berries.",
    price: 4.5,
    category: "breakfast",
    calories: 320, protein: 24, carbs: 30, fat: 10,
  },
  {
    id: "b2",
    name: "Egg White & Veggie Scramble",
    description: "Egg whites with spinach, peppers, and feta.",
    price: 4.0,
    category: "breakfast",
    calories: 220, protein: 22, carbs: 8, fat: 10,
  },
  {
    id: "b3",
    name: "Overnight Oats",
    description: "Oats with chia seeds, almond milk, and honey.",
    price: 3.5,
    category: "breakfast",
    calories: 280, protein: 12, carbs: 42, fat: 8,
  },
  {
    id: "b4",
    name: "Avocado Toast & Eggs",
    description: "Sourdough with smashed avocado and poached eggs.",
    price: 5.0,
    category: "breakfast",
    calories: 380, protein: 18, carbs: 30, fat: 20,
  },
  {
    id: "s1",
    name: "Protein Balls (6 pack)",
    description: "Peanut butter chocolate protein balls.",
    price: 3.0,
    category: "snack",
    calories: 240, protein: 16, carbs: 20, fat: 12,
  },
  {
    id: "s2",
    name: "Greek Yogurt & Granola",
    description: "High-protein Greek yogurt with house granola.",
    price: 3.5,
    category: "snack",
    calories: 200, protein: 18, carbs: 22, fat: 6,
  },
];

export const WEEK_MENUS: WeekMenu[] = [
  {
    weekLabel: "This Week",
    startDate: "Apr 28",
    meals: MEALS.slice(0, 14),
  },
  {
    weekLabel: "Next Week",
    startDate: "May 5",
    meals: [...MEALS.slice(7, 14), ...MEALS.slice(0, 7)],
  },
  {
    weekLabel: "In 2 Weeks",
    startDate: "May 12",
    meals: [...MEALS.slice(4, 14), ...MEALS.slice(0, 4)],
  },
];

export const PRICING = {
  standardPerMeal: 8.5,
  flexiblePerMeal: 10.0,
  standardDiscount: 0.15, // 15% off vs flexible
};

export const GOALS_OPTIONS = [
  { value: "improve-health" as const, label: "Improve Health", icon: "heart" },
  { value: "weight-loss" as const, label: "Weight Loss", icon: "scale" },
  { value: "muscle-gain" as const, label: "Muscle Gain", icon: "dumbbell" },
  { value: "save-time" as const, label: "Save Time", icon: "clock" },
];

export const PREFERENCE_OPTIONS = [
  { value: "calorie-smart" as const, label: "Calorie Smart", description: "Balanced meals under 400 cal" },
  { value: "high-protein" as const, label: "High Protein", description: "30g+ protein per meal" },
  { value: "gluten-free" as const, label: "Gluten Free", description: "No gluten ingredients" },
  { value: "healthy" as const, label: "Healthy", description: "Whole foods, balanced macros" },
];

export const AVOID_OPTIONS = [
  { value: "tuna" as const, label: "Tuna" },
  { value: "pork" as const, label: "Pork" },
];
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/data.ts
git commit -m "feat: add types and mock data for meals, plans, and add-ons"
```

---

### Task 2: Global Styles, Layout, Navbar, and Footer

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `components/navbar.tsx`
- Create: `components/footer.tsx`

- [ ] **Step 1: Update global CSS**

Replace `app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --color-primary: #059669;
  --color-primary-dark: #047857;
  --color-primary-light: #d1fae5;
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: #059669;
  --color-primary-dark: #047857;
  --color-primary-light: #d1fae5;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 2: Create Navbar**

Create `components/navbar.tsx`:

```tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            ORA<span className="text-primary">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/menu" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Our Menu
            </Link>
            <Link
              href="/get-started"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
          <Link
            href="/get-started"
            className="md:hidden bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create Footer**

Create `components/footer.tsx`:

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-bold text-white">
              ORA<span className="text-primary">.</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed">
              Fresh, chef-prepared meals delivered to your door. Fuel your goals with zero effort.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/menu" className="hover:text-white transition-colors">Our Menu</Link>
              <Link href="/get-started" className="hover:text-white transition-colors">Get Started</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Delivery Schedule</h4>
            <div className="text-sm space-y-1">
              <p>Sunday - Mon & Tue meals</p>
              <p>Tuesday - Wed & Thu meals</p>
              <p>Thursday - Fri, Sat & Sun meals</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-center">
          &copy; 2026 ORA Nutrition. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update root layout**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORA Nutrition | Fresh Meal Prep Delivered",
  description: "Chef-prepared, macro-balanced meals delivered to your door. Choose your plan and fuel your goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx components/navbar.tsx components/footer.tsx
git commit -m "feat: add navbar, footer, and global styles with ORA branding"
```

---

### Task 3: Home Page — Hero, How It Works, Meal Preview

**Files:**
- Create: `components/hero.tsx`
- Create: `components/how-it-works.tsx`
- Create: `components/meal-card.tsx`
- Create: `components/meal-preview.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create Hero component**

Create `components/hero.tsx`:

```tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80')",
        }}
      />
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-xl">
          <span className="inline-block bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            Get 20% off your first week
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Eat Fresh.{" "}
            <span className="text-primary">Fuel Right.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-md">
            Chef-prepared, macro-balanced meals delivered 3x a week. No cooking, no cleanup, no compromise.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-started"
              className="bg-primary text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-primary-dark transition-colors text-center"
            >
              Get Started
            </Link>
            <Link
              href="/menu"
              className="border border-white/30 text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white/10 transition-colors text-center"
            >
              View Menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create How It Works component**

Create `components/how-it-works.tsx`:

```tsx
const STEPS = [
  {
    number: "1",
    title: "Tell Us Your Goals",
    description: "Select your health goals and meal preferences.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Choose Your Plan",
    description: "Pick Standard for ease or Flexible for full control.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "We Prepare Your Meals",
    description: "Fresh ingredients, cooked by professional chefs.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      </svg>
    ),
  },
  {
    number: "4",
    title: "Delivered to Your Door",
    description: "3 deliveries per week — Sunday, Tuesday, Thursday.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Four simple steps to healthy eating
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-5 bg-primary-light rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create MealCard component**

Create `components/meal-card.tsx`:

```tsx
import { Meal } from "@/lib/types";

interface MealCardProps {
  meal: Meal;
  onSelect?: () => void;
  selected?: boolean;
  showSelect?: boolean;
}

export default function MealCard({ meal, onSelect, selected, showSelect }: MealCardProps) {
  const categoryColors: Record<string, string> = {
    "calorie-smart": "bg-blue-100 text-blue-700",
    "high-protein": "bg-orange-100 text-orange-700",
    "gluten-free": "bg-purple-100 text-purple-700",
    healthy: "bg-green-100 text-green-700",
  };

  const categoryLabel = meal.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden border-2 transition-all hover:shadow-lg ${
        selected ? "border-primary shadow-lg" : "border-gray-100"
      }`}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
          </svg>
        </div>
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[meal.category] || "bg-gray-100 text-gray-700"}`}>
          {categoryLabel}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1">{meal.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{meal.description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-semibold text-gray-900">{meal.calories} cal</span>
          <span>P: {meal.protein}g</span>
          <span>C: {meal.carbs}g</span>
          <span>F: {meal.fat}g</span>
        </div>
        {showSelect && (
          <button
            onClick={onSelect}
            className={`mt-3 w-full py-2 rounded-full text-sm font-semibold transition-colors ${
              selected
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {selected ? "Selected" : "Add to Plan"}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create MealPreview component for home page**

Create `components/meal-preview.tsx`:

```tsx
import Link from "next/link";
import { MEALS } from "@/lib/data";
import MealCard from "./meal-card";

export default function MealPreview() {
  const featured = MEALS.slice(0, 4);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            This Week&apos;s Menu
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Chef-prepared meals, fresh every week
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/menu"
            className="inline-block bg-primary text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-primary-dark transition-colors"
          >
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Build the home page**

Replace `app/page.tsx` with:

```tsx
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import MealPreview from "@/components/meal-preview";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <MealPreview />

      {/* CTA Banner */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to eat better?
          </h2>
          <p className="mt-4 text-emerald-100 text-lg">
            Join thousands who save time and hit their goals with ORA meals.
          </p>
          <Link
            href="/get-started"
            className="inline-block mt-8 bg-white text-primary px-8 py-3.5 rounded-full text-base font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started — 20% Off First Week
          </Link>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/hero.tsx components/how-it-works.tsx components/meal-card.tsx components/meal-preview.tsx app/page.tsx
git commit -m "feat: build home page with hero, how-it-works, meal preview, and CTA"
```

---

### Task 4: Get Started — Multi-Step Wizard

**Files:**
- Create: `components/step-indicator.tsx`
- Create: `app/get-started/page.tsx`

- [ ] **Step 1: Create step indicator**

Create `components/step-indicator.tsx`:

```tsx
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between">
        {labels.map((label, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          return (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-0.5 ${
                    isCompleted || isActive ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isActive
                    ? "bg-primary text-white ring-4 ring-primary-light"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium hidden sm:block ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the wizard page**

Create `app/get-started/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import StepIndicator from "@/components/step-indicator";
import {
  GOALS_OPTIONS,
  PREFERENCE_OPTIONS,
  AVOID_OPTIONS,
  PRICING,
} from "@/lib/data";
import type {
  Goal,
  MealPreference,
  AvoidIngredient,
  MealsPerDay,
  DaysPerWeek,
  PlanType,
  UserSelections,
} from "@/lib/types";

const STEP_LABELS = ["Goals", "Preferences", "Avoid", "Meals/Day", "Days/Week", "Plan"];

const initialSelections: UserSelections = {
  goals: [],
  preferences: [],
  avoid: [],
  mealsPerDay: null,
  daysPerWeek: null,
  planType: null,
};

export default function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<UserSelections>(initialSelections);

  const totalMeals =
    (selections.mealsPerDay ?? 0) * (selections.daysPerWeek ?? 0);

  function toggleGoal(goal: Goal) {
    setSelections((s) => ({
      ...s,
      goals: s.goals.includes(goal)
        ? s.goals.filter((g) => g !== goal)
        : [...s.goals, goal],
    }));
  }

  function togglePreference(pref: MealPreference) {
    setSelections((s) => ({
      ...s,
      preferences: s.preferences.includes(pref)
        ? s.preferences.filter((p) => p !== pref)
        : [...s.preferences, pref],
    }));
  }

  function toggleAvoid(item: AvoidIngredient) {
    setSelections((s) => ({
      ...s,
      avoid: s.avoid.includes(item)
        ? s.avoid.filter((a) => a !== item)
        : [...s.avoid, item],
    }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1: return selections.goals.length > 0;
      case 2: return selections.preferences.length > 0;
      case 3: return true; // avoid is optional
      case 4: return selections.mealsPerDay !== null;
      case 5: return selections.daysPerWeek !== null;
      case 6: return selections.planType !== null;
      default: return false;
    }
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <StepIndicator currentStep={step} totalSteps={6} labels={STEP_LABELS} />

        {/* Step 1: Goals */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              What are your goals?
            </h2>
            <p className="text-gray-500 text-center mb-8">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {GOALS_OPTIONS.map((opt) => {
                const active = selections.goals.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleGoal(opt.value)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? "border-primary bg-primary-light/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-base font-semibold text-gray-900">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Meal Preferences */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Meal preferences
            </h2>
            <p className="text-gray-500 text-center mb-8">What kind of meals do you prefer?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {PREFERENCE_OPTIONS.map((opt) => {
                const active = selections.preferences.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => togglePreference(opt.value)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? "border-primary bg-primary-light/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-base font-semibold text-gray-900 block">
                      {opt.label}
                    </span>
                    <span className="text-sm text-gray-500">{opt.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Avoid */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Anything to avoid?
            </h2>
            <p className="text-gray-500 text-center mb-8">Optional — skip if none</p>
            <div className="flex gap-4 justify-center">
              {AVOID_OPTIONS.map((opt) => {
                const active = selections.avoid.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleAvoid(opt.value)}
                    className={`px-8 py-4 rounded-2xl border-2 font-semibold transition-all ${
                      active
                        ? "border-primary bg-primary-light/50 text-gray-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Meals Per Day */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Meals per day
            </h2>
            <p className="text-gray-500 text-center mb-8">How many meals do you need daily?</p>
            <div className="flex gap-4 justify-center">
              {([1, 2, 3] as MealsPerDay[]).map((n) => {
                const active = selections.mealsPerDay === n;
                const labels: Record<number, string> = {
                  1: "1 meal",
                  2: "2 meals",
                  3: "3 meals",
                };
                const sublabels: Record<number, string> = {
                  1: "Lunch or Dinner",
                  2: "Lunch & Dinner",
                  3: "Full Day",
                };
                return (
                  <button
                    key={n}
                    onClick={() => setSelections((s) => ({ ...s, mealsPerDay: n }))}
                    className={`px-6 py-5 rounded-2xl border-2 text-center transition-all min-w-[120px] ${
                      active
                        ? "border-primary bg-primary-light/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="block text-xl font-bold text-gray-900">{labels[n]}</span>
                    <span className="text-sm text-gray-500">{sublabels[n]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Days Per Week */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Days per week
            </h2>
            <p className="text-gray-500 text-center mb-8">How many days should we deliver?</p>
            <div className="flex gap-4 justify-center">
              {([5, 6, 7] as DaysPerWeek[]).map((n) => {
                const active = selections.daysPerWeek === n;
                const sublabels: Record<number, string> = {
                  5: "Weekdays",
                  6: "Mon – Sat",
                  7: "Everyday",
                };
                return (
                  <button
                    key={n}
                    onClick={() => setSelections((s) => ({ ...s, daysPerWeek: n }))}
                    className={`px-6 py-5 rounded-2xl border-2 text-center transition-all min-w-[120px] ${
                      active
                        ? "border-primary bg-primary-light/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="block text-xl font-bold text-gray-900">{n} days</span>
                    <span className="text-sm text-gray-500">{sublabels[n]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Plan Type */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Choose your plan
            </h2>
            <p className="text-gray-500 text-center mb-8">
              {totalMeals} meals per week
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Standard */}
              <button
                onClick={() => setSelections((s) => ({ ...s, planType: "standard" }))}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                  selections.planType === "standard"
                    ? "border-primary bg-primary-light/30 ring-2 ring-primary"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Recommended
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">Standard Plan</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  Pre-selected meals optimized for your preferences. No decisions needed.
                </p>
                <div className="text-3xl font-bold text-gray-900">
                  AED {(PRICING.standardPerMeal * totalMeals).toFixed(0)}
                  <span className="text-base font-normal text-gray-500">/week</span>
                </div>
                <p className="text-sm text-primary font-semibold mt-1">
                  AED {PRICING.standardPerMeal.toFixed(1)} per meal — Best Value
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    No decision fatigue
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Auto-renewed weekly
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Discounted price
                  </li>
                </ul>
              </button>

              {/* Flexible */}
              <button
                onClick={() => setSelections((s) => ({ ...s, planType: "flexible" }))}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  selections.planType === "flexible"
                    ? "border-primary bg-primary-light/30 ring-2 ring-primary"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <h3 className="text-xl font-bold text-gray-900 mt-2">Flexible Plan</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  Pick your own meals each week from our rotating menu of 14 options.
                </p>
                <div className="text-3xl font-bold text-gray-900">
                  AED {(PRICING.flexiblePerMeal * totalMeals).toFixed(0)}
                  <span className="text-base font-normal text-gray-500">/week</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  AED {PRICING.flexiblePerMeal.toFixed(1)} per meal
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Full meal control
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Choose from 14 meals weekly
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Pick duplicates allowed
                  </li>
                </ul>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 max-w-2xl mx-auto">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-gray-500 font-semibold hover:text-gray-900 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 6 ? (
            <button
              onClick={() => canAdvance() && setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <Link
              href={selections.planType === "flexible" ? "/menu?select=true" : "/menu"}
              className={`bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors ${
                !canAdvance() ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {selections.planType === "flexible" ? "Choose Your Meals" : "View Your Menu"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/step-indicator.tsx app/get-started/page.tsx
git commit -m "feat: add multi-step get-started wizard with 6-step flow"
```

---

### Task 5: Weekly Menu Page with Category Filters

**Files:**
- Create: `app/menu/page.tsx`

- [ ] **Step 1: Create menu page**

Create `app/menu/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MealCard from "@/components/meal-card";
import AddOns from "@/components/add-ons";
import { WEEK_MENUS } from "@/lib/data";
import type { MealCategory } from "@/lib/types";

const CATEGORIES: { value: MealCategory | "all"; label: string }[] = [
  { value: "all", label: "All Meals" },
  { value: "calorie-smart", label: "Calorie Smart" },
  { value: "high-protein", label: "High Protein" },
  { value: "gluten-free", label: "Gluten Free" },
  { value: "healthy", label: "Healthy" },
];

function MenuContent() {
  const searchParams = useSearchParams();
  const isSelectMode = searchParams.get("select") === "true";

  const [weekIndex, setWeekIndex] = useState(0);
  const [category, setCategory] = useState<MealCategory | "all">("all");
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const targetMeals = 12; // example: 2 meals x 6 days

  const currentWeek = WEEK_MENUS[weekIndex];
  const filteredMeals =
    category === "all"
      ? currentWeek.meals
      : currentWeek.meals.filter((m) => m.category === category);

  function toggleMeal(mealId: string) {
    setSelectedMeals((prev) => {
      if (prev.includes(mealId)) {
        return prev.filter((id) => id !== mealId);
      }
      if (prev.length >= targetMeals) return prev;
      return [...prev, mealId];
    });
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Weekly Menu
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            14 chef-prepared meals, fresh every week
          </p>
        </div>

        {/* Week Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {WEEK_MENUS.map((week, i) => (
            <button
              key={week.weekLabel}
              onClick={() => setWeekIndex(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                weekIndex === i
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {week.weekLabel}
              <span className="block text-xs font-normal opacity-70">{week.startDate}</span>
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Selection Progress (Flexible mode) */}
        {isSelectMode && (
          <div className="bg-white rounded-2xl p-4 mb-8 flex items-center justify-between border border-gray-200 max-w-xl mx-auto">
            <div>
              <span className="text-sm text-gray-500">Meals selected</span>
              <div className="text-xl font-bold text-gray-900">
                {selectedMeals.length}{" "}
                <span className="text-gray-400 font-normal">/ {targetMeals}</span>
              </div>
            </div>
            <div className="flex-1 mx-6">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(selectedMeals.length / targetMeals) * 100}%` }}
                />
              </div>
            </div>
            <button
              disabled={selectedMeals.length < targetMeals}
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Meal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              showSelect={isSelectMode}
              selected={selectedMeals.includes(meal.id)}
              onSelect={() => toggleMeal(meal.id)}
            />
          ))}
        </div>

        {/* Add-ons Section */}
        <AddOns />
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-gray-50" />}>
      <MenuContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/menu/page.tsx
git commit -m "feat: add weekly menu page with category filters and meal selection"
```

---

### Task 6: Add-Ons Component

**Files:**
- Create: `components/add-ons.tsx`

- [ ] **Step 1: Create add-ons component**

Create `components/add-ons.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ADD_ONS } from "@/lib/data";

export default function AddOns() {
  const [selected, setSelected] = useState<Record<string, number>>({});

  const breakfasts = ADD_ONS.filter((a) => a.category === "breakfast");
  const snacks = ADD_ONS.filter((a) => a.category === "snack");

  function increment(id: string) {
    setSelected((s) => ({ ...s, [id]: (s[id] || 0) + 1 }));
  }

  function decrement(id: string) {
    setSelected((s) => {
      const count = (s[id] || 0) - 1;
      if (count <= 0) {
        const next = { ...s };
        delete next[id];
        return next;
      }
      return { ...s, [id]: count };
    });
  }

  const totalAddOnPrice = Object.entries(selected).reduce((sum, [id, qty]) => {
    const addon = ADD_ONS.find((a) => a.id === id);
    return sum + (addon ? addon.price * qty : 0);
  }, 0);

  function renderAddOnCard(addon: (typeof ADD_ONS)[number]) {
    const qty = selected[addon.id] || 0;
    return (
      <div
        key={addon.id}
        className={`bg-white rounded-2xl p-4 border-2 transition-all ${
          qty > 0 ? "border-primary" : "border-gray-100"
        }`}
      >
        <div className="aspect-[3/2] bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl mb-3 flex items-center justify-center text-orange-300">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
          </svg>
        </div>
        <h4 className="font-semibold text-gray-900 text-sm">{addon.name}</h4>
        <p className="text-xs text-gray-500 mt-0.5 mb-2">{addon.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">
            AED {addon.price.toFixed(1)}
          </span>
          {qty === 0 ? (
            <button
              onClick={() => increment(addon.id)}
              className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              + Add
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => decrement(addon.id)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-sm font-bold w-4 text-center">{qty}</span>
              <button
                onClick={() => increment(addon.id)}
                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add-Ons</h2>
          <p className="text-gray-500 text-sm mt-1">
            Boost your plan with breakfast and snacks
          </p>
        </div>
        {totalAddOnPrice > 0 && (
          <span className="text-sm font-semibold text-primary">
            + AED {totalAddOnPrice.toFixed(1)}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakfast</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {breakfasts.map(renderAddOnCard)}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Snacks</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {snacks.map(renderAddOnCard)}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/add-ons.tsx
git commit -m "feat: add breakfast and snack add-ons with quantity controls"
```

---

### Task 7: Verify and Fix

- [ ] **Step 1: Run dev server and verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Fix any build errors**

Address TypeScript or import errors if any arise.

- [ ] **Step 3: Visual check with Playwright**

Navigate to `http://localhost:3000` and take screenshots of:
- Home page
- Get Started wizard (each step)
- Menu page
- Menu page with `?select=true`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: resolve any build issues and finalize initial implementation"
```
