// Light / dark / follow-the-system, remembered between visits.
// The choice is written to <html data-theme="..."> and styles.css does the rest.
export type Theme = "system" | "light" | "dark";

const KEY = "gryphcal-theme";
export const ORDER: Theme[] = ["system", "light", "dark"];

export function getTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system"; // storage can be blocked; fall back quietly
  }
}

export function applyTheme(theme: Theme): void {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}

export function nextTheme(t: Theme): Theme {
  return ORDER[(ORDER.indexOf(t) + 1) % ORDER.length];
}
