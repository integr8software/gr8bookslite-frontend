import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const BranchDashboardSpotlightTutorialStorageVersion = "v1";
export const BranchDashboardSpotlightTutorialOpenEvent =
  "gr8booksneo:branch-dashboard-spotlight-open";
export const BranchDashboardSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.${BranchDashboardSpotlightTutorialStorageVersion}./dashboard`;

export const BranchDashboardSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the branch dashboard controls",
    description:
      "This area shows the current dashboard state and keeps the main actions for adding, customizing, and sharing dashboards close at hand.",
    selectors: ["[data-spotlight-id='branch-dashboard-header']"],
  },
  {
    key: "add-dashboard",
    title: "Create a new dashboard from here",
    description:
      "Use this action when your branch needs a fresh dashboard layout for a new workflow, role, or reporting view.",
    selectors: ["[data-spotlight-id='branch-dashboard-add']"],
  },
  {
    key: "summary",
    title: "Read the dashboard health at a glance",
    description:
      "These summary cards give a quick snapshot of approvals, shared dashboards, package setup, and saved views.",
    selectors: ["[data-spotlight-id='branch-dashboard-summary']"],
  },
  {
    key: "library",
    title: "Review the dashboard library",
    description:
      "The library lists available dashboards, who owns them, who can see them, and what widget setup each one supports.",
    selectors: ["[data-spotlight-id='branch-dashboard-library']"],
  },
  {
    key: "builder",
    title: "Preview the dashboard layout structure",
    description:
      "This builder preview shows how summary blocks, charts, queues, and supporting panels can be arranged in a dashboard.",
    selectors: ["[data-spotlight-id='branch-dashboard-builder']"],
  },
  {
    key: "activity",
    title: "Check access and recent changes",
    description:
      "Use these sections to confirm who can work with dashboards and to review the latest dashboard activity in the branch.",
    selectors: [
      "[data-spotlight-id='branch-dashboard-team-access']",
      "[data-spotlight-id='branch-dashboard-activity']",
    ],
  },
] satisfies readonly SpotlightTourStep[];
