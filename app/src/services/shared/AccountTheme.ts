import type { AccountTheme } from "@/app/src/types/shared/AccountTypes";

const ThemeAttributeName = "data-app-theme";

export function ApplyAccountTheme(theme: AccountTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute(ThemeAttributeName, theme);
}
