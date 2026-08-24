"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ApplyAccountAccentColor, ApplyAccountFontSize, ApplyAccountTheme } from "@/app/src/services/shared/account/AccountTheme";
import { DefaultAccountAccentColor } from "@/app/src/constants/shared/account/AccountConstants";
import { AccountPreferencesStorageKey, AccountThemeRoutePrefixes } from "@/app/src/constants/shared/account/AccountThemeRoutes";
import { useAccountPreferences } from "@/app/src/hooks/shared/account/useAccountPreferences";
import type { AccountAccentColor, AccountFontSize, AccountTheme } from "@/app/src/types/shared/account/AccountTypes";

function ResolveTheme(pathname: string | null, theme: AccountTheme): AccountTheme {
  if (!IsModuleRoute(pathname)) {
    return "classic-light";
  }

  return theme;
}

function ResolveAccentColor(pathname: string | null, accentColor: AccountAccentColor): AccountAccentColor {
  if (!IsModuleRoute(pathname)) {
    return DefaultAccountAccentColor;
  }

  return accentColor;
}

function ResolveFontSize(pathname: string | null, fontSize: AccountFontSize): AccountFontSize {
  if (!IsModuleRoute(pathname)) {
    return "comfortable";
  }

  return fontSize;
}

function IsModuleRoute(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return AccountThemeRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function AppThemeEffect() {
  const pathname = usePathname();
  const [systemThemeVersion, setSystemThemeVersion] = useState(0);
  const theme = useAccountPreferences((state) => state.theme);
  const fontSize = useAccountPreferences((state) => state.fontSize);
  const accentColor = useAccountPreferences((state) => state.accentColor);
  const resolvedTheme = ResolveTheme(pathname, theme);
  const resolvedFontSize = ResolveFontSize(pathname, fontSize);
  const resolvedAccentColor = ResolveAccentColor(pathname, accentColor);

  useLayoutEffect(() => {
    ApplyAccountTheme(resolvedTheme);
  }, [resolvedTheme, systemThemeVersion]);

  useLayoutEffect(() => {
    ApplyAccountAccentColor(resolvedAccentColor);
  }, [resolvedAccentColor]);

  useLayoutEffect(() => {
    ApplyAccountFontSize(resolvedFontSize);
  }, [resolvedFontSize]);

  useEffect(() => {
    function handleAccountPreferencesStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) {
        return;
      }

      if (event.key !== AccountPreferencesStorageKey) {
        return;
      }

      void useAccountPreferences.persist.rehydrate();
    }

    window.addEventListener("storage", handleAccountPreferencesStorage);

    return () => {
      window.removeEventListener("storage", handleAccountPreferencesStorage);
    };
  }, []);

  useEffect(() => {
    if (resolvedTheme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemThemeChange() {
      setSystemThemeVersion((currentVersion) => currentVersion + 1);
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [resolvedTheme]);

  return null;
}
