import type {
  AccountAccentColor,
  AccountTheme,
} from "@/app/src/types/shared/account/AccountTypes";

const ThemeAttributeName = "data-app-theme";
const AccentColorVariableName = "--skyblue";
const AccentColorRgbVariableName = "--skyblue-rgb";
const AccentContrastVariableName = "--skyblue-contrast";

const DarkTextAccentColors = new Set(["#f59e0b"]);

export function ApplyAccountTheme(theme: AccountTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute(ThemeAttributeName, theme);
}

export function ApplyAccountAccentColor(accentColor: AccountAccentColor) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.style.setProperty(AccentColorVariableName, accentColor);
  document.documentElement.style.setProperty(
    AccentColorRgbVariableName,
    HexToRgb(accentColor),
  );
  document.documentElement.style.setProperty(
    AccentContrastVariableName,
    GetAccentContrastColor(accentColor),
  );
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
