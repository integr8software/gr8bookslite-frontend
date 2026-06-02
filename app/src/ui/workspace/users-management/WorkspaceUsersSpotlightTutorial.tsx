"use client";

import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
  WorkspaceUsersSpotlightTutorialOpenEvent,
  WorkspaceUsersSpotlightTutorialSteps,
  WorkspaceUsersSpotlightTutorialStorageKey,
} from "@/app/src/data/workspace/users-management/WorkspaceUsersSpotlightTutorialData";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function WorkspaceUsersSpotlightTutorial({
  isEnabled = true,
  onComplete,
}: {
  isEnabled?: boolean;
  onComplete?: () => void;
}) {
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: WorkspaceUsersManagementHref,
    isEnabled,
    openEvent: WorkspaceUsersSpotlightTutorialOpenEvent,
    storageKey: WorkspaceUsersSpotlightTutorialStorageKey,
  });

  return (
    <SpotlightTour
      ariaLabel="Workspace user management tutorial"
      badge={<SpotlightTourBadge>Workspace users guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={WorkspaceUsersSpotlightTutorialSteps}
      onComplete={() => {
        completeTutorial();
        onComplete?.();
      }}
      onSkip={skipTutorial}
    />
  );
}
