"use client";

import { useMemo } from "react";
import { GetVisibleSettingsItems, ResolveAccountVisibilityRole } from "@/app/src/data/shared/account/AccountData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useAccountPreferences } from "@/app/src/hooks/shared/account/useAccountPreferences";

export function useAccountSettings() {
  const accessToken = useAppStore((state) => state.accessToken);
  const hasHydrated = useAccountPreferences((state) => state.hasHydrated);
  const theme = useAccountPreferences((state) => state.theme);
  const fontSize = useAccountPreferences((state) => state.fontSize);
  const accentColor = useAccountPreferences((state) => state.accentColor);
  const notificationPreference = useAccountPreferences((state) => state.notificationPreference);
  const setTheme = useAccountPreferences((state) => state.setTheme);
  const setFontSize = useAccountPreferences((state) => state.setFontSize);
  const setAccentColor = useAccountPreferences((state) => state.setAccentColor);
  const setNotificationPreference = useAccountPreferences((state) => state.setNotificationPreference);
  const { data: authProfile } = useAuthProfileQuery({ accessToken });
  const role = ResolveAccountVisibilityRole(authProfile);
  const visibleItemKeys = useMemo(() => GetVisibleSettingsItems(role), [role]);

  return {
    accentColor,
    accessToken,
    email: authProfile?.user.email ?? "",
    fontSize,
    hasHydrated,
    notificationPreference,
    role,
    theme,
    visibleItemKeys,
    setAccentColor,
    setFontSize,
    setNotificationPreference,
    setTheme,
  };
}
