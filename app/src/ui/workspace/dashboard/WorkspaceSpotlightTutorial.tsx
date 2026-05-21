"use client";

import { WorkspaceSpotlightTutorialSteps } from "@/app/src/data/modules/dashboard/WorkspaceSpotlightTutorialData";
import { useWorkspaceSpotlightTutorial } from "@/app/src/hooks/modules/dashboard/useWorkspaceSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/SpotlightTour";

export function WorkspaceSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } =
    useWorkspaceSpotlightTutorial();

  return (
    <SpotlightTour
      ariaLabel="Workspace tutorial"
      badge={
        <SpotlightTourBadge>
          New account guide
        </SpotlightTourBadge>
      }
      isOpen={isOpen}
      steps={WorkspaceSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
