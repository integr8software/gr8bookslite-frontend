export type AccountVisibilityRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type AccountProfileFieldKey =
  | "avatar"
  | "fullName"
  | "email"
  | "contactNumber";

export type AccountSettingsItemKey =
  | "changePassword"
  | "theme"
  | "notificationPreference";

export type AccountTheme = "classic-light" | "soft-sky" | "warm-contrast";

export type AccountNotificationPreference = "all" | "important" | "none";

export type AccountProfileDraft = {
  avatarDataUrl?: string | null;
  fullName?: string;
  contactNumber?: string;
};

export type AccountProfileViewModel = {
  userId: string;
  role: AccountVisibilityRole;
  fullName: string;
  email: string;
  contactNumber: string;
  avatarDataUrl: string | null;
  initials: string;
  roleLabel: string;
};

export type AccountVisibilityConfig<TKey extends string> = {
  key: TKey;
  visibleTo: AccountVisibilityRole[];
};
