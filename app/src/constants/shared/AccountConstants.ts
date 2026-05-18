import type {
  AccountNotificationPreference,
  AccountTheme,
} from "@/app/src/types/shared/AccountTypes";

export const ProfileHref = "/profile";
export const SettingsHref = "/settings";
export const WorkspaceSettingsHref = "/workspace/settings";

export const AccountThemeOptions: Array<{
  value: AccountTheme;
  label: string;
  description: string;
}> = [
  {
    value: "classic-light",
    label: "Classic Light",
    description: "A bright default theme using the core Gr8Books Lite palette.",
  },
  {
    value: "soft-sky",
    label: "Soft Sky",
    description: "A cooler interface tone with lighter blue accents.",
  },
  {
    value: "warm-contrast",
    label: "Warm Contrast",
    description: "A warmer surface treatment with stronger contrast for focus.",
  },
];

export const AccountNotificationPreferenceOptions: Array<{
  value: AccountNotificationPreference;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "All Notifications",
    description: "Show general updates, reminders, and actionable alerts.",
  },
  {
    value: "important",
    label: "Important Only",
    description: "Reduce noise and keep only key account and workflow alerts.",
  },
  {
    value: "none",
    label: "Muted",
    description: "Silence optional notices for this device until you change it back.",
  },
];
