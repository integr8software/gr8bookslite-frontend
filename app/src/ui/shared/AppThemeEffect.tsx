"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ApplyAccountAccentColor,
  ApplyAccountTheme,
} from "@/app/src/services/shared/AccountTheme";
import { DefaultAccountAccentColor } from "@/app/src/constants/shared/AccountConstants";
import { useAccountPreferences } from "@/app/src/hooks/shared/useAccountPreferences";
import type {
  AccountAccentColor,
  AccountTheme,
} from "@/app/src/types/shared/AccountTypes";

const PublicLightThemeRoutes = ["/login", "/signup", "/forgot-password", "/otp"];

function ResolveTheme(pathname: string | null, theme: AccountTheme): AccountTheme {
  if (!pathname) {
    return theme;
  }

  if (
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    PublicLightThemeRoutes.includes(pathname)
  ) {
    return "classic-light";
  }

  return theme;
}

function ResolveAccentColor(
  pathname: string | null,
  accentColor: AccountAccentColor,
): AccountAccentColor {
  if (!pathname) {
    return accentColor;
  }

  if (
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    PublicLightThemeRoutes.includes(pathname)
  ) {
    return DefaultAccountAccentColor;
  }

  return accentColor;
}

export function AppThemeEffect() {
  const pathname = usePathname();
  const theme = useAccountPreferences((state) => state.theme);
  const accentColor = useAccountPreferences((state) => state.accentColor);
  const resolvedTheme = ResolveTheme(pathname, theme);
  const resolvedAccentColor = ResolveAccentColor(pathname, accentColor);

  useEffect(() => {
    ApplyAccountTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    ApplyAccountAccentColor(resolvedAccentColor);
  }, [resolvedAccentColor]);

  return null;
}
