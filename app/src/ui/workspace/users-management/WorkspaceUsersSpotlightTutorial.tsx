"use client";

import { useCallback } from "react";
import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
  WorkspaceUsersSpotlightTutorialOpenEvent,
  WorkspaceUsersListSpotlightTutorialStepCount,
  WorkspaceUsersSpotlightTutorialSteps,
  WorkspaceUsersSpotlightTutorialStorageKey,
} from "@/app/src/data/workspace/users-management/WorkspaceUsersSpotlightTutorialData";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function WorkspaceUsersSpotlightTutorial({
  onOpenAddDrawer,
}: {
  onOpenAddDrawer: () => void;
}) {
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: WorkspaceUsersManagementHref,
    openEvent: WorkspaceUsersSpotlightTutorialOpenEvent,
    storageKey: WorkspaceUsersSpotlightTutorialStorageKey,
  });
  const handleStepEnter = useCallback(
    (_: unknown, index: number) => {
      if (index === WorkspaceUsersListSpotlightTutorialStepCount) {
        onOpenAddDrawer();
      }
    },
    [onOpenAddDrawer],
  );

  return (
    <SpotlightTour
      ariaLabel="Workspace user management tutorial"
      badge={<SpotlightTourBadge>Workspace users guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={WorkspaceUsersSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onStepEnter={handleStepEnter}
      onSkip={skipTutorial}
    />
  );
}
