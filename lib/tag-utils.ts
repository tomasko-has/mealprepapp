export const TAG_COLORS: Record<string, string> = {
  "high-protein": "bg-orange-100 text-orange-700",
  "low-carb": "bg-blue-100 text-blue-700",
  "keto": "bg-purple-100 text-purple-700",
  "calorie-smart": "bg-teal-100 text-teal-700",
  "gluten-free": "bg-pink-100 text-pink-700",
  "healthy": "bg-green-100 text-green-700",
};

export function formatTagLabel(tag: string): string {
  return tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
