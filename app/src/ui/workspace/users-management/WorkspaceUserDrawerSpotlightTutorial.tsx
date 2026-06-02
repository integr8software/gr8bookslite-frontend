"use client";

import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
  getWorkspaceUserDrawerSpotlightTutorialSteps,
  getWorkspaceUserDrawerSpotlightTutorialStorageKey,
  WorkspaceUserDrawerSpotlightTutorialOpenEvent,
  WorkspaceUserDrawerSpotlightTutorialPathnamePrefixes,
} from "@/app/src/data/workspace/users-management/WorkspaceUserDrawerSpotlightTutorialData";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

type WorkspaceUserDrawerSpotlightTutorialProps = {
  isOpen: boolean;
  mode: "add" | "edit";
};

export function WorkspaceUserDrawerSpotlightTutorial({
  isOpen,
  mode,
}: WorkspaceUserDrawerSpotlightTutorialProps) {
  const { completeTutorial, isOpen: isTutorialOpen, skipTutorial } =
    useSpotlightTutorial({
      href: WorkspaceUsersManagementHref,
      isEnabled: isOpen,
      openEvent: WorkspaceUserDrawerSpotlightTutorialOpenEvent,
      pathnamePrefixes: WorkspaceUserDrawerSpotlightTutorialPathnamePrefixes,
      storageKey: getWorkspaceUserDrawerSpotlightTutorialStorageKey(mode),
    });

  return (
    <SpotlightTour
      ariaLabel={`${mode === "add" ? "Add" : "Edit"} workspace user tutorial`}
      badge={<SpotlightTourBadge>User drawer guide</SpotlightTourBadge>}
      isOpen={isTutorialOpen}
      steps={getWorkspaceUserDrawerSpotlightTutorialSteps(mode)}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
