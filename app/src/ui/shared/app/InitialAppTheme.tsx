import Script from "next/script";

import {
  AccountPreferencesStorageKey,
  AccountThemeCookieName,
  AccountThemeRoutePrefixes,
} from "@/app/src/constants/shared/account/AccountThemeRoutes";

const InitialAppThemeConfig = {
  preferencesStorageKey: AccountPreferencesStorageKey,
  themeCookieName: AccountThemeCookieName,
  themeRoutePrefixes: AccountThemeRoutePrefixes,
};

const InitialAppThemeScript = `
try {
  var pathname = window.location.pathname;
  var config = ${JSON.stringify(InitialAppThemeConfig)};
  var isThemeRoute = config.themeRoutePrefixes.some(function (prefix) {
    return pathname === prefix || pathname.indexOf(prefix + "/") === 0;
  });
  var systemTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "midnight-dark"
    : "classic-light";
  var theme = "classic-light";
  var fontSize = "comfortable";
  var fontSizePercent = {
    compact: "85%",
    comfortable: "90%",
    large: "100%"
  };

  if (isThemeRoute) {
    var storedPreferences = window.localStorage.getItem(config.preferencesStorageKey);
    var preferences = storedPreferences ? JSON.parse(storedPreferences) : null;
    var preferenceTheme = preferences && preferences.state && preferences.state.theme
      ? preferences.state.theme
      : "system";
    var preferenceFontSize = preferences && preferences.state && preferences.state.fontSize
      ? preferences.state.fontSize
      : "comfortable";
    theme = preferenceTheme === "system"
      ? systemTheme
      : preferenceTheme === "midnight-dark"
        ? "midnight-dark"
        : "classic-light";
    fontSize = fontSizePercent[preferenceFontSize] ? preferenceFontSize : "comfortable";
  }

  document.documentElement.setAttribute("data-app-theme", theme);
  document.cookie = config.themeCookieName + "=" + theme + "; path=/; max-age=31536000; samesite=lax";
} catch {
  document.documentElement.setAttribute("data-app-theme", "classic-light");
  document.documentElement.setAttribute("data-app-font-size", "comfortable");
  document.documentElement.style.setProperty("--app-root-font-size", "90%");
}
`;

export function InitialAppTheme() {
  return <Script id="initial-app-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: InitialAppThemeScript }} />;
}
