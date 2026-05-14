import type { UserSelections } from "./types";

const STORAGE_KEY = "wizardSelections";

export function saveWizardSelections(selections: UserSelections): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
}

export function loadWizardSelections(): UserSelections | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSelections;
  } catch {
    return null;
  }
}
