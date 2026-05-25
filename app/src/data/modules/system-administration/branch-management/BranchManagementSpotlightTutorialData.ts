import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const BranchManagementSpotlightTutorialStorageVersion = "v1";
export const BranchManagementSpotlightTutorialOpenEvent =
  "gr8booksneo:branch-management-spotlight-open";
export const BranchManagementSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.${BranchManagementSpotlightTutorialStorageVersion}.${BranchManagementHref}`;

export const BranchManagementSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the branch management overview",
    description:
      "This page is where admins maintain branches and satellite offices used throughout the company and switcher flows.",
    selectors: ["[data-spotlight-id='branch-management-header']"],
  },
  {
    key: "add-branch",
    title: "Create a branch or satellite here",
    description:
      "Use this action to register a new branch record before it becomes available to the rest of the system.",
    selectors: ["[data-spotlight-id='branch-management-add']"],
  },
  {
    key: "directory",
    title: "Review the branch directory",
    description:
      "This directory shows the current branches, company codes, classifications, and tax details at a glance.",
    selectors: ["[data-spotlight-id='branch-management-table']"],
  },
  {
    key: "actions",
    title: "Open each branch from its action area",
    description:
      "Use the row actions to review, edit, or remove branch records as your organizational structure changes.",
    selectors: ["[data-spotlight-id='branch-management-actions']"],
  },
] satisfies readonly SpotlightTourStep[];
