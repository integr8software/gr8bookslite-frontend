import type { AccountAccentColor, AccountFontSize, AccountTheme } from "@/app/src/types/shared/account/AccountTypes";
import { AccountThemeCookieName } from "@/app/src/constants/shared/account/AccountThemeRoutes";

const ThemeAttributeName = "data-app-theme";
const SystemThemeMediaQuery = "(prefers-color-scheme: dark)";
const AccentColorVariableName = "--skyblue";
const AccentColorRgbVariableName = "--skyblue-rgb";
const AccentContrastVariableName = "--skyblue-contrast";
const FontSizeVariableName = "--app-root-font-size";

const DarkTextAccentColors = new Set(["#f59e0b"]);
const AccountFontSizePercent: Record<AccountFontSize, string> = {
  compact: "85%",
  comfortable: "90%",
  large: "100%",
};

export function ApplyAccountTheme(theme: AccountTheme) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = ResolveAccountTheme(theme);

  document.documentElement.setAttribute(ThemeAttributeName, resolvedTheme);
  document.cookie = `${AccountThemeCookieName}=${resolvedTheme}; path=/; max-age=31536000; samesite=lax`;
}

export function ResolveAccountTheme(theme: AccountTheme) {
  if (theme === "system" && typeof window !== "undefined" && window.matchMedia(SystemThemeMediaQuery).matches) {
    return "midnight-dark";
  }

  return theme === "midnight-dark" ? "midnight-dark" : "classic-light";
}

export function ApplyAccountAccentColor(accentColor: AccountAccentColor) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.style.setProperty(AccentColorVariableName, accentColor);
  document.documentElement.style.setProperty(AccentColorRgbVariableName, HexToRgb(accentColor));
  document.documentElement.style.setProperty(AccentContrastVariableName, GetAccentContrastColor(accentColor));
}

export function ApplyAccountFontSize(fontSize: AccountFontSize) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-app-font-size", fontSize);
  document.documentElement.style.setProperty(FontSizeVariableName, AccountFontSizePercent[fontSize]);
}

function HexToRgb(hexColor: string) {
  const normalizedHex = hexColor.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}

function GetAccentContrastColor(accentColor: AccountAccentColor) {
  return DarkTextAccentColors.has(accentColor.toLowerCase()) ? "#212738" : "#ffffff";
}
