import { ChartsOfAccountsHref } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const ChartsOfAccountsSpotlightTutorialStorageVersion = "v1";
export const ChartsOfAccountsSpotlightTutorialOpenEvent =
  "gr8booksneo:charts-of-accounts-spotlight-open";
export const ChartsOfAccountsSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.${ChartsOfAccountsSpotlightTutorialStorageVersion}.${ChartsOfAccountsHref}`;

export const ChartsOfAccountsSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the module overview",
    description:
      "This header gives your team the purpose of the module and keeps the main account actions within reach.",
    selectors: ["[data-spotlight-id='charts-of-accounts-header']"],
  },
  {
    key: "add-account",
    title: "Add new accounts from here",
    description:
      "Use this action to create a new chart account, map it to the right statement group, and keep the account tree organized.",
    selectors: ["[data-spotlight-id='charts-of-accounts-add-account']"],
  },
  {
    key: "tabs",
    title: "Switch account views quickly",
    description:
      "These tabs help you jump between all accounts, statement-group slices, and inactive records without rebuilding filters each time.",
    selectors: ["[data-spotlight-id='charts-of-accounts-tabs']"],
  },
  {
    key: "filters",
    title: "Narrow the list with filters",
    description:
      "Search and filter by account type, statement group, or status to find the exact accounts you need to review.",
    selectors: ["[data-spotlight-id='charts-of-accounts-filters']"],
  },
  {
    key: "table",
    title: "Review and manage the account tree",
    description:
      "This table is where you sort, expand, edit, and review account relationships across the chart of accounts.",
    selectors: ["[data-spotlight-id='charts-of-accounts-table']"],
  },
] satisfies readonly SpotlightTourStep[];
