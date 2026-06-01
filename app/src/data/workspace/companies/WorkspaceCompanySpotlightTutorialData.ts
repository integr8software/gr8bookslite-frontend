import { WorkspaceCompaniesHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const WorkspaceCompanySpotlightTutorialOpenEvent =
  "gr8booksneo:workspace-company-spotlight-open";
export const WorkspaceCompanySpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.v1.${WorkspaceCompaniesHref}`;

export const WorkspaceCompanySpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the company directory",
    description:
      "Use this page to maintain workspace companies, their plans, branches, and assigned users.",
    selectors: ["[data-spotlight-id='workspace-company-header']"],
  },
  {
    key: "add-company",
    title: "Register a new company here",
    description:
      "Create a company record before setting up its branches, users, and subscription details.",
    selectors: ["[data-spotlight-id='workspace-company-add']"],
  },
  {
    key: "metrics",
    title: "Review workspace coverage quickly",
    description:
      "These cards summarize the companies, users, branches, and workspace administration scope.",
    selectors: ["[data-spotlight-id='workspace-company-metrics']"],
  },
  {
    key: "filters",
    title: "Find the right company faster",
    description:
      "Search the directory and narrow results by status, company type, or subscription plan.",
    selectors: ["[data-spotlight-id='workspace-company-filters']"],
  },
  {
    key: "table",
    title: "Manage company records from the table",
    description:
      "Open, edit, or deactivate companies from this directory as your workspace changes.",
    selectors: ["[data-spotlight-id='workspace-company-table']"],
  },
] satisfies readonly SpotlightTourStep[];
