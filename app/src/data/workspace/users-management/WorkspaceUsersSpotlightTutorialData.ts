import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";
import { getWorkspaceUserDrawerSpotlightTutorialSteps } from "@/app/src/data/workspace/users-management/WorkspaceUserDrawerSpotlightTutorialData";

export const WorkspaceUsersSpotlightTutorialOpenEvent =
  "gr8booksneo:workspace-users-spotlight-open";
export const WorkspaceUsersSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.v1.${WorkspaceUsersManagementHref}`;

export const WorkspaceUsersSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with workspace user management",
    description:
      "This page keeps workspace accounts and their company, branch, or satellite assignments organized.",
    selectors: ["[data-spotlight-id='workspace-users-header']"],
  },
  {
    key: "add-user",
    title: "Invite a workspace user here",
    description:
      "Add a user account and assign the companies and locations they need to access.",
    selectors: ["[data-spotlight-id='workspace-users-add']"],
  },
  {
    key: "filters",
    title: "Filter the user directory",
    description:
      "Search users by account details or narrow the list by invitation and account status.",
    selectors: ["[data-spotlight-id='workspace-users-filters']"],
  },
  {
    key: "table",
    title: "Review and update user access",
    description:
      "Use the directory to inspect status, resend pending invitations, view profiles, or edit assignments.",
    selectors: ["[data-spotlight-id='workspace-users-table']"],
  },
  ...getWorkspaceUserDrawerSpotlightTutorialSteps("add"),
] satisfies readonly SpotlightTourStep[];

export const WorkspaceUsersListSpotlightTutorialStepCount = 4;
