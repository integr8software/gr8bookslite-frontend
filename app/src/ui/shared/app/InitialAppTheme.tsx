import {
  AccountPreferencesStorageKey,
  AccountThemeCookieName,
  AccountThemeRoutePrefixes,
} from "@/app/src/constants/shared/account/AccountThemeRoutes";

const InitialAppThemeScript = `
try {
  var pathname = window.location.pathname;
  var isThemeRoute = ${JSON.stringify(AccountThemeRoutePrefixes)}.some(function (prefix) {
    return pathname === prefix || pathname.indexOf(prefix + "/") === 0;
  });
  var systemTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "midnight-dark"
    : "classic-light";
  var theme = "classic-light";

  if (isThemeRoute) {
    var storedPreferences = window.localStorage.getItem("${AccountPreferencesStorageKey}");
    var preferences = storedPreferences ? JSON.parse(storedPreferences) : null;
    var preferenceTheme = preferences && preferences.state && preferences.state.theme
      ? preferences.state.theme
      : "system";
    theme = preferenceTheme === "system"
      ? systemTheme
      : preferenceTheme === "midnight-dark"
        ? "midnight-dark"
        : "classic-light";
  }

  document.documentElement.setAttribute("data-app-theme", theme);
  document.cookie = "${AccountThemeCookieName}=" + theme + "; path=/; max-age=31536000; samesite=lax";
} catch {
  document.documentElement.setAttribute("data-app-theme", "classic-light");
}
`;

export function InitialAppTheme() {
  return (
    <script
      id="initial-app-theme"
      dangerouslySetInnerHTML={{ __html: InitialAppThemeScript }}
    />
  );
}
