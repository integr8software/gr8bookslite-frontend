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
  const theme = useAccountPreferences((state) => state.theme);
  const notificationPreference = useAccountPreferences(
    (state) => state.notificationPreference,
  );
  const setTheme = useAccountPreferences((state) => state.setTheme);
  const setNotificationPreference = useAccountPreferences(
    (state) => state.setNotificationPreference,
  );
  const { data: authProfile } = useAuthProfileQuery({ accessToken });
  const role = ResolveAccountVisibilityRole(authProfile);
  const visibleItemKeys = useMemo(() => GetVisibleSettingsItems(role), [role]);

  return {
    notificationPreference,
    role,
    theme,
    visibleItemKeys,
    setNotificationPreference,
    setTheme,
  };
}
