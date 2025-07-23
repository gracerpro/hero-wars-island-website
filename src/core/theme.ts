export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";

export type Theme = "light" | "dark"

export function isValidTheme(theme: string) {
  return theme === THEME_LIGHT || theme === THEME_DARK;
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
}
