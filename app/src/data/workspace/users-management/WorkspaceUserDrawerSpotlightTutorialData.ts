import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const WorkspaceUserDrawerSpotlightTutorialOpenEvent =
  "gr8booksneo:workspace-user-drawer-spotlight-open";
export const WorkspaceUserDrawerSpotlightTutorialPathnamePrefixes = [
  `${WorkspaceUsersManagementHref}/add`,
  `${WorkspaceUsersManagementHref}/edit/`,
] as const;

export function getWorkspaceUserDrawerSpotlightTutorialStorageKey(
  mode: "add" | "edit",
) {
  return `gr8booksneo.spotlightTutorial.v1.${WorkspaceUsersManagementHref}.${mode}-drawer`;
}

export function getWorkspaceUserDrawerSpotlightTutorialSteps(
  mode: "add" | "edit",
) {
  const actionLabel = mode === "add" ? "Create" : "Update";

  return [
    {
      key: "drawer",
      title: `${actionLabel} a workspace user`,
      description:
        "Use this drawer to maintain the user profile and their access assignments without leaving the directory.",
      selectors: ["[data-spotlight-id='workspace-user-drawer']"],
    },
    {
      key: "details",
      title: "Complete the user details",
      description:
        "Enter the user's name, email address, and contact number. Email editing depends on the account status.",
      selectors: ["[data-spotlight-id='workspace-user-drawer-details']"],
    },
    {
      key: "assignments",
      title: "Assign company and branch access",
      description:
        "Choose a company, add it to the user, then select the head office, branches, or satellites they can access.",
      selectors: ["[data-spotlight-id='workspace-user-drawer-assignments']"],
    },
    {
      key: "save",
      title: `${actionLabel} the user account`,
      description:
        "Save the drawer when the profile and access assignments are ready. New users may require confirmation before creation.",
      selectors: ["[data-spotlight-id='workspace-user-drawer-save']"],
    },
  ] satisfies readonly SpotlightTourStep[];
}
