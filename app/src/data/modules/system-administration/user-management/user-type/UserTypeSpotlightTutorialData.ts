import { UserTypeHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/SpotlightTourTypes";

export const UserTypeSpotlightTutorialStorageVersion = "v1";
export const UserTypeSpotlightTutorialOpenEvent =
  "gr8booksneo:user-type-spotlight-open";
export const UserTypeSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.${UserTypeSpotlightTutorialStorageVersion}.${UserTypeHref}`;

export const UserTypeSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the role template overview",
    description:
      "This page is where admins define reusable user types so access patterns stay consistent across the workspace.",
    selectors: ["[data-spotlight-id='user-type-header']"],
  },
  {
    key: "add-type",
    title: "Create new user types here",
    description:
      "Use this action to add a new role template before assigning it to users in the user list.",
    selectors: ["[data-spotlight-id='user-type-add']"],
  },
  {
    key: "list",
    title: "Review existing role templates",
    description:
      "This list shows the available user types, their descriptions, and how many access roles are attached to each one.",
    selectors: ["[data-spotlight-id='user-type-list']"],
  },
  {
    key: "actions",
    title: "Open each template to manage details",
    description:
      "Use the record actions on each card to review, edit, or remove user types as responsibilities change.",
    selectors: ["[data-spotlight-id='user-type-actions']"],
  },
] satisfies readonly SpotlightTourStep[];
