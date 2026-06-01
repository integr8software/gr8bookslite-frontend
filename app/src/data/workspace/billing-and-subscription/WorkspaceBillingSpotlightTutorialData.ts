import { WorkspaceBillingSubscriptionHref } from "@/app/src/constants/workspace/billing-and-subscription/WorkspaceBillingSubscriptionConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const WorkspaceBillingSpotlightTutorialOpenEvent =
  "gr8booksneo:workspace-billing-spotlight-open";
export const WorkspaceBillingSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.v1.${WorkspaceBillingSubscriptionHref}`;

export const WorkspaceBillingSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with workspace billing",
    description:
      "This page keeps company subscriptions, renewal checks, payment cards, and promotions in one place.",
    selectors: ["[data-spotlight-id='workspace-billing-header']"],
  },
  {
    key: "metrics",
    title: "Check billing health at a glance",
    description:
      "These cards summarize companies, renewal alerts, usage add-ons, and the current payable total.",
    selectors: ["[data-spotlight-id='workspace-billing-metrics']"],
  },
  {
    key: "filters",
    title: "Locate billing accounts quickly",
    description:
      "Search by company, renewal, or code and use the renewal filter to focus on accounts needing attention.",
    selectors: ["[data-spotlight-id='workspace-billing-filters']"],
  },
  {
    key: "table",
    title: "Manage subscriptions from the billing table",
    description:
      "Review pricing, add-ons, renewal status, payment cards, promotions, and available billing actions per company.",
    selectors: ["[data-spotlight-id='workspace-billing-table']"],
  },
] satisfies readonly SpotlightTourStep[];
