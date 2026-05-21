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

const ModuleRoutePrefixes = [
  "/accounts-payable",
  "/cash-disbursement",
  "/cash-receipt",
  "/dashboard",
  "/general-journal",
  "/inventory",
  "/maintenance",
  "/others",
  "/profile",
  "/purchasing",
  "/reports",
  "/sales",
  "/settings",
  "/system-administration",
  "/workspace"
];

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

  return ModuleRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
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
