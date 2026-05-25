import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const UserListSpotlightTutorialStorageVersion = "v1";
export const UserListSpotlightTutorialOpenEvent =
  "gr8booksneo:users-spotlight-open";
export const UserListSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.${UserListSpotlightTutorialStorageVersion}.${UserListHref}`;

export const UserListSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the user management overview",
    description:
      "This header gives admins a quick orientation and keeps the main actions for managing users close by.",
    selectors: ["[data-spotlight-id='users-header']"],
  },
  {
    key: "add-user",
    title: "Add new users from here",
    description:
      "Use this action to create a user profile and assign the right user role.",
    selectors: ["[data-spotlight-id='users-add-user']"],
  },
  {
    key: "filters",
    title: "Filter the user directory quickly",
    description:
      "Search and filter by status or user role to narrow the list before reviewing account access.",
    selectors: ["[data-spotlight-id='users-filters']"],
  },
  {
    key: "table",
    title: "Review access assignments in one place",
    description:
      "The table shows each user's role setup, current status, and last login so admins can verify access at a glance.",
    selectors: ["[data-spotlight-id='users-table']"],
  },
] satisfies readonly SpotlightTourStep[];
