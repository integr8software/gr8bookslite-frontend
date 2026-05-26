import { UserRoleHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const UserRoleSpotlightTutorialStorageVersion = "v1";
export const UserRoleSpotlightTutorialOpenEvent =
  "gr8booksneo:user-role-spotlight-open";
export const UserRoleSpotlightTutorialStorageKey = `gr8booksneo.spotlightTutorial.${UserRoleSpotlightTutorialStorageVersion}.${UserRoleHref}`;

export const UserRoleSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the role template overview",
    description:
      "This page is where admins define reusable user roles so access patterns stay consistent across the workspace.",
    selectors: ["[data-spotlight-id='user-role-header']"],
  },
  {
    key: "add-type",
    title: "Create new user roles here",
    description:
      "Use this action to add a new role template before assigning it to users.",
    selectors: ["[data-spotlight-id='user-role-add']"],
  },
  {
    key: "list",
    title: "Review existing role templates",
    description:
      "This list shows the available user roles, their descriptions, and how many access roles are attached to each one.",
    selectors: ["[data-spotlight-id='user-role-list']"],
  },
  {
    key: "actions",
    title: "Open each template to manage details",
    description:
      "Use the record actions on each card to review, edit, or mark user roles inactive as responsibilities change.",
    selectors: ["[data-spotlight-id='user-role-actions']"],
  },
] satisfies readonly SpotlightTourStep[];
