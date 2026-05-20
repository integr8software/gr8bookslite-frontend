import type { SpotlightTourStep } from "@/app/src/types/shared/SpotlightTourTypes";

export const WorkspaceSpotlightTutorialAccountWindowDays = 14;

export const WorkspaceSpotlightTutorialStorageVersion = "v1";
export const WorkspaceSpotlightTutorialOpenEvent =
  "gr8booksneo:workspace-spotlight-open";

export const WorkspaceSpotlightTutorialSteps = [
  {
    key: "sidebar",
    title: "Start with the workspace navigation",
    description:
      "This is your main map. Use it to jump between workspace dashboards, companies, settings, and the admin modules available to your role.",
    selectors: [
      "[data-spotlight-id='workspace-sidebar']",
      "[data-spotlight-id='workspace-sidebar-toggle']",
    ],
  },
  {
    key: "company-switcher",
    title: "Switch context in one click",
    description:
      "Open this switcher anytime you need to move between the full workspace view and a specific company context.",
    selectors: ["[data-spotlight-id='workspace-company-switcher']"],
  },
  {
    key: "search",
    title: "Search modules fast",
    description:
      "The search bar helps you jump directly to pages and modules without digging through the menu.",
    selectors: ["[data-spotlight-id='workspace-search']"],
  },
  {
    key: "notifications",
    title: "Keep an eye on updates",
    description:
      "Notifications surface approvals, alerts, and workspace activity that may need attention from your team.",
    selectors: ["[data-spotlight-id='workspace-notifications']"],
  },
  {
    key: "hero",
    title: "Manage your dashboard layout",
    description:
      "Use these controls to customize what appears on the dashboard and rearrange the layout around how your team works.",
    selectors: [
      "[data-spotlight-id='workspace-dashboard-customize']",
      "[data-spotlight-id='workspace-dashboard-hero']",
    ],
  },
  {
    key: "summary",
    title: "Read the health of the workspace quickly",
    description:
      "These summary cards give you the fastest snapshot of companies, users, and activity across the workspace.",
    selectors: ["[data-spotlight-id='workspace-dashboard-summary']"],
  },
  {
    key: "approvals",
    title: "Check urgent work first",
    description:
      "Your approval queue gathers high-priority items so new admins know where to take action first.",
    selectors: ["[data-spotlight-id='workspace-dashboard-approvals']"],
  },
] satisfies readonly SpotlightTourStep[];
