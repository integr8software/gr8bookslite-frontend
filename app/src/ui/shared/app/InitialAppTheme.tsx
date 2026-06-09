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
  var theme = "classic-light";

  if (isThemeRoute) {
    var storedPreferences = window.localStorage.getItem("${AccountPreferencesStorageKey}");
    var preferences = storedPreferences ? JSON.parse(storedPreferences) : null;
    theme = preferences && preferences.state && preferences.state.theme
      ? preferences.state.theme
      : theme;
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
