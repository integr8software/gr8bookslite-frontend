import type {
  AccountAccentColor,
  AccountNotificationPreference,
  AccountTheme,
} from "@/app/src/types/shared/account/AccountTypes";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const ProfileHref = "/account/profile";
export const SettingsHref = "/account/settings";
export const WorkspaceSettingsHref = "/workspace/system-settings";

export const AccountThemeOptions: Array<{
  value: AccountTheme;
  label: string;
  description: string;
  preview: {
    surface: string;
    panel: string;
    accent: string;
    highlight: string;
    text: string;
  };
}> = [
  {
    value: "classic-light",
    label: "Classic Light",
    description: `A bright default theme using the core ${AppName} palette.`,
    preview: {
      surface: "#f8fafc",
      panel: "#ffffff",
      accent: "#212738",
      highlight: "#57c4e5",
      text: "#212738",
    },
  },
  {
    value: "midnight-dark",
    label: "GitHub Dark",
    description: "A neutral dark workspace with GitHub-style surfaces, borders, and blue highlights.",
    preview: {
      surface: "#0d1117",
      panel: "#161b22",
      accent: "#c9d1d9",
      highlight: "#58a6ff",
      text: "#c9d1d9",
    },
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

export const DefaultAccountAccentColor: AccountAccentColor = "#57c4e5";

export const AccountAccentColorOptions: Array<{
  value: AccountAccentColor;
  label: string;
}> = [
  { value: "#57c4e5", label: "Sky Blue" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#22c55e", label: "Green" },
  { value: "#f97068", label: "Coral" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#a855f7", label: "Purple" },
];
