export type AccountVisibilityRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type AccountProfileFieldKey =
  | "avatar"
  | "fullName"
  | "email"
  | "contactNumber";

export type AccountSettingsItemKey =
  | "changePassword"
  | "theme"
  | "accentColor"
  | "notificationPreference";

export type AccountTheme = "classic-light" | "midnight-dark";

export type AccountAccentColor =
  | "#57c4e5"
  | "#3b82f6"
  | "#14b8a6"
  | "#22c55e"
  | "#f97068"
  | "#f59e0b"
  | "#a855f7";

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
