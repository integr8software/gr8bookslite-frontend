"use client";

import { BranchManagementSpotlightTutorialSteps } from "@/app/src/data/modules/system-administration/branch-management/BranchManagementSpotlightTutorialData";
import { useBranchManagementSpotlightTutorial } from "@/app/src/hooks/modules/system-administration/branch-management/useBranchManagementSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/SpotlightTour";

export function BranchManagementSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } =
    useBranchManagementSpotlightTutorial();

  return (
    <SpotlightTour
      appearance="light"
      ariaLabel="Branch management tutorial"
      badge={
        <SpotlightTourBadge appearance="light">
          Branch management guide
        </SpotlightTourBadge>
      }
      isOpen={isOpen}
      steps={BranchManagementSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
