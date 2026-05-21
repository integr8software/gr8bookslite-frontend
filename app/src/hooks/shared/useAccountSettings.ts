"use client";

import { useMemo } from "react";
import {
  GetVisibleSettingsItems,
  ResolveAccountVisibilityRole,
} from "@/app/src/data/shared/AccountData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";
import { useAccountPreferences } from "@/app/src/hooks/shared/useAccountPreferences";

export function useAccountSettings() {
  const accessToken = useAppStore((state) => state.accessToken);
  const hasHydrated = useAccountPreferences((state) => state.hasHydrated);
  const theme = useAccountPreferences((state) => state.theme);
  const accentColor = useAccountPreferences((state) => state.accentColor);
  const notificationPreference = useAccountPreferences(
    (state) => state.notificationPreference,
  );
  const setTheme = useAccountPreferences((state) => state.setTheme);
  const setAccentColor = useAccountPreferences((state) => state.setAccentColor);
  const setNotificationPreference = useAccountPreferences(
    (state) => state.setNotificationPreference,
  );
  const { data: authProfile } = useAuthProfileQuery({ accessToken });
  const role = ResolveAccountVisibilityRole(authProfile);
  const visibleItemKeys = useMemo(() => GetVisibleSettingsItems(role), [role]);

  return {
    accentColor,
    accessToken,
    email: authProfile?.user.email ?? "",
    hasHydrated,
    notificationPreference,
    role,
    theme,
    visibleItemKeys,
    setAccentColor,
    setNotificationPreference,
    setTheme,
  };
}
