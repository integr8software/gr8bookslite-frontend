"use client";

import { useEffect } from "react";
import { ApplyAccountTheme } from "@/app/src/services/shared/AccountTheme";
import { useAccountPreferences } from "@/app/src/hooks/shared/useAccountPreferences";

export function AppThemeEffect() {
  const theme = useAccountPreferences((state) => state.theme);

  useEffect(() => {
    ApplyAccountTheme(theme);
  }, [theme]);

  return null;
}
