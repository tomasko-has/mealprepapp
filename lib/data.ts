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
