export const THEME_LIGHT = "light"
export const THEME_DARK = "dark"

export function isValidTheme(theme) {
  return theme === THEME_LIGHT || theme === THEME_DARK;
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme)
}
