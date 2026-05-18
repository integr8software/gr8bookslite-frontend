"use client";

import { useEffect } from "react";
import {
  ApplyAccountAccentColor,
  ApplyAccountTheme,
} from "@/app/src/services/shared/AccountTheme";
import { useAccountPreferences } from "@/app/src/hooks/shared/useAccountPreferences";

export function AppThemeEffect() {
  const theme = useAccountPreferences((state) => state.theme);
  const accentColor = useAccountPreferences((state) => state.accentColor);

  useEffect(() => {
    ApplyAccountTheme(theme);
  }, [theme]);

  useEffect(() => {
    ApplyAccountAccentColor(accentColor);
  }, [accentColor]);

  return null;
}
