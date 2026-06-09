"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ApplyAccountAccentColor,
  ApplyAccountTheme,
} from "@/app/src/services/shared/account/AccountTheme";
import { DefaultAccountAccentColor } from "@/app/src/constants/shared/account/AccountConstants";
import {
  AccountPreferencesStorageKey,
  AccountThemeRoutePrefixes,
} from "@/app/src/constants/shared/account/AccountThemeRoutes";
import { useAccountPreferences } from "@/app/src/hooks/shared/account/useAccountPreferences";
import type {
  AccountAccentColor,
  AccountTheme,
} from "@/app/src/types/shared/account/AccountTypes";

function ResolveTheme(pathname: string | null, theme: AccountTheme): AccountTheme {
  if (!IsModuleRoute(pathname)) {
    return "classic-light";
  }

  return theme;
}

function ResolveAccentColor(
  pathname: string | null,
  accentColor: AccountAccentColor,
): AccountAccentColor {
  if (!IsModuleRoute(pathname)) {
    return DefaultAccountAccentColor;
  }

  return accentColor;
}

function IsModuleRoute(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return AccountThemeRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AppThemeEffect() {
  const pathname = usePathname();
  const theme = useAccountPreferences((state) => state.theme);
  const accentColor = useAccountPreferences((state) => state.accentColor);
  const resolvedTheme = ResolveTheme(pathname, theme);
  const resolvedAccentColor = ResolveAccentColor(pathname, accentColor);

  useLayoutEffect(() => {
    ApplyAccountTheme(resolvedTheme);
  }, [resolvedTheme]);

  useLayoutEffect(() => {
    ApplyAccountAccentColor(resolvedAccentColor);
  }, [resolvedAccentColor]);

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

  return null;
}
