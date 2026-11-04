// Seed content for the singletons and plans, taken from the text that is hardcoded in the
// current components (hero.tsx, how-it-works.tsx, plan-cards.tsx, footer.tsx, app/about,
// app/how-it-works) so the site looks the same once the frontend reads it from Sanity.

export const WEEKS = [
  { file: "week-1.csv", title: "Week 1", slug: "week-1", weekStart: "2026-10-26" },
  { file: "week-2.csv", title: "Week 2", slug: "week-2", weekStart: "2026-11-02" },
  { file: "week-3.csv", title: "Week 3", slug: "week-3", weekStart: "2026-11-09" },
];

export const ADD_ON_FILES = ["addons-breakfast.csv", "addons-snacks.csv"];

// Tags that exist in lib/types.ts (MealTag) but not in PREFERENCE_OPTIONS in lib/data.ts.
export const EXTRA_PREFERENCES = [
  { value: "low-carb", label: "Low Carb", description: "" },
  { value: "keto", label: "Keto", description: "" },
];

// meals per day (1-3) x days per week (5-7), as offered by the get-started wizard
export const PLAN_MEAL_COUNTS = [5, 6, 7, 10, 12, 14, 15, 18, 21];

export const STANDARD_DISCOUNT = 0.2;

export const PLANS = [
  {
    title: "Standard Plan",
    planType: "standard",
    badge: "Recommended",
    description:
      "Pre-selected meals optimized for your goals and preferences. No decisions needed — just heat and eat.",
    features: [
      "No decision fatigue",
      "Auto-renewed weekly",
      "20% discount on all meals",
      "Matched to your dietary preferences",
    ],
    order: 1,
  },
  {
    title: "Flexible Plan",
    planType: "flexible",
    badge: null,
    description:
      "Pick your own meals each week from our rotating menu of 14 options. Full control over what you eat.",
    features: [
      "Full meal control",
      "Choose from 14 meals weekly",
      "Pick duplicates allowed",
      "Change meals anytime before cutoff",
    ],
    order: 2,
  },
];

const getStarted = { label: "Get Started", href: "/get-started" };

export const SITE_SETTINGS = {
  _id: "siteSettings",
  _type: "siteSettings",
  companyName: "ORA Nutrition",
  tagline: "Fresh, chef-prepared meals delivered to your door. Fuel your goals with zero effort.",
  colors: { primary: "#059669", primaryDark: "#047857", primaryLight: "#d1fae5" },
  deliveryDays: [
    { day: "sunday", note: "Mon & Tue meals" },
    { day: "tuesday", note: "Wed & Thu meals" },
    { day: "thursday", note: "Fri, Sat & Sun meals" },
  ],
};

export const HOME_PAGE = {
  _id: "homePage",
  _type: "homePage",
  hero: {
    badge: "Get 20% off your first week",
    heading: "Eat Fresh.",
    highlight: "Fuel Right.",
    text: "Chef-prepared, macro-balanced meals delivered 3x a week. No cooking, no cleanup, no compromise.",
    primaryCta: getStarted,
    secondaryCta: { label: "View Menu", href: "#menu" },
  },
  howItWorksSection: { heading: "How It Works", subheading: "Four simple steps to healthy eating" },
  steps: [
    { title: "Tell Us Your Goals", description: "Select your health goals and meal preferences.", icon: "user" },
    { title: "Choose Your Plan", description: "Pick Standard for ease or Flexible for full control.", icon: "clipboard" },
    { title: "We Prepare Your Meals", description: "Fresh ingredients, cooked by professional chefs.", icon: "flame" },
    { title: "Delivered to Your Door", description: "3 deliveries per week — Sunday, Tuesday, Thursday.", icon: "truck" },
  ],
  plansSection: { heading: "Choose Your Plan", subheading: "Two ways to enjoy chef-prepared meals every week" },
  cta: {
    heading: "Ready to eat better?",
    text: "Join thousands who save time and hit their goals with ORA meals.",
    button: { label: "Get Started — 20% Off in Standard Plan", href: "/get-started" },
  },
};

export const ABOUT_PAGE = {
  _id: "aboutPage",
  _type: "aboutPage",
  hero: {
    heading: "Fuel Your Life, Not Your Stress",
    text:
      "ORA Nutrition was born from a simple idea: eating well shouldn't be complicated. We prepare fresh, chef-crafted meals so you can focus on what matters — your goals, your time, your life.",
  },
  mission: {
    heading: "Our Mission",
    paragraphs: [
      "We believe everyone deserves access to nutritious, delicious food without spending hours in the kitchen. Our team of professional chefs creates a rotating menu of 14 meals every week, using fresh, locally sourced ingredients.",
      "Whether you're looking to lose weight, build muscle, or simply save time — we've got a plan that fits your lifestyle.",
    ],
    stats: [
      { value: "14", label: "new meals every week" },
      { value: "3x", label: "deliveries per week" },
      { value: "0", label: "cooking required" },
    ],
  },
  valuesSection: { heading: "What We Stand For" },
  values: [
    {
      title: "Fresh First",
      description: "Never frozen, never processed. Every meal is prepared fresh and delivered within hours of cooking.",
      icon: "leaf",
    },
    {
      title: "Balanced Nutrition",
      description: "Every meal is designed with the right balance of protein, carbs, and healthy fats to fuel your day.",
      icon: "scale",
    },
    {
      title: "Save Time",
      description: "No shopping, no cooking, no cleanup. Just heat, eat, and get on with your day.",
      icon: "clock",
    },
  ],
  deliverySection: { heading: "Delivery Schedule" },
  cta: {
    heading: "Ready to get started?",
    text: "Choose your plan and start eating better this week.",
    button: { label: "Get Started — 20% Off First Week", href: "/get-started" },
  },
};

export const HOW_IT_WORKS_PAGE = {
  _id: "howItWorksPage",
  _type: "howItWorksPage",
  hero: {
    heading: "Healthy Eating, Made Simple",
    text: "From choosing your plan to eating your first meal — here's everything you need to know.",
  },
  steps: [
    {
      title: "Tell Us Your Goals",
      description:
        "Take our quick quiz to share your health goals, dietary preferences, and any ingredients to avoid. We use this to personalize your menu.",
      icon: "user",
    },
    {
      title: "Pick Your Plan",
      description:
        "Choose Standard for a curated selection at 20% off, or Flexible to hand-pick your own meals each week from our rotating menu of 14 options.",
      icon: "clipboard",
    },
    {
      title: "We Cook, You Relax",
      description:
        "Our professional chefs prepare your meals fresh using locally sourced ingredients. No preservatives, no shortcuts — just real food.",
      icon: "flame",
    },
    {
      title: "Delivered 3x a Week",
      description:
        "Your meals arrive fresh on Sunday, Tuesday, and Thursday. Just heat and eat — each meal is ready in under 3 minutes.",
      icon: "truck",
    },
  ],
  plansSection: { heading: "Which Plan Is Right for You?" },
  faqSection: { heading: "Frequently Asked Questions" },
  faqs: [
    {
      question: "When do I need to select my meals?",
      answer:
        "For Flexible plans, meal selection opens each week. If you don't select by the deadline, we'll send you our Standard curated selection.",
    },
    {
      question: "Can I skip a week?",
      answer:
        "Not yet, but we're working on adding pause and skip functionality. You can cancel anytime from your account page.",
    },
    {
      question: "How do I heat my meals?",
      answer:
        "Simply microwave for 2-3 minutes or heat in a pan for 5 minutes. Instructions are included with every meal.",
    },
    {
      question: "What if I have allergies?",
      answer: "During signup, you can mark ingredients to avoid. Every meal lists full ingredients and allergen information.",
    },
  ],
  cta: {
    heading: "Ready to eat better?",
    text: "Start your personalized meal plan in under 2 minutes.",
    button: { label: "Get Started — 20% Off First Week", href: "/get-started" },
  },
};
