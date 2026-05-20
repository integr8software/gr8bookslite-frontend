import { UserGroupHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/SpotlightTourTypes";

export const UserGroupSpotlightTutorialStorageVersion = "v1";
export const UserGroupSpotlightTutorialOpenEvent =
  "gr8bookslite:user-group-spotlight-open";
export const UserGroupSpotlightTutorialStorageKey =
  `gr8bookslite.spotlightTutorial.${UserGroupSpotlightTutorialStorageVersion}.${UserGroupHref}`;

export const UserGroupSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the team grouping overview",
    description:
      "This page helps admins organize people into user groups that reflect departments, teams, or operational units.",
    selectors: ["[data-spotlight-id='user-group-header']"],
  },
  {
    key: "add-group",
    title: "Create new user groups here",
    description:
      "Use this action when you need a new department or team grouping before assigning users into it.",
    selectors: ["[data-spotlight-id='user-group-add']"],
  },
  {
    key: "list",
    title: "Review the current group structure",
    description:
      "This list shows each user group, its description, and current status so admins can keep teams organized.",
    selectors: ["[data-spotlight-id='user-group-list']"],
  },
  {
    key: "actions",
    title: "Manage each group from its action area",
    description:
      "Use the card actions to view, edit, or remove groups as your organizational structure changes.",
    selectors: ["[data-spotlight-id='user-group-actions']"],
  },
] satisfies readonly SpotlightTourStep[];
