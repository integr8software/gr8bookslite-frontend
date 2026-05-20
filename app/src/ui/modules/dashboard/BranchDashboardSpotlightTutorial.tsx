"use client";

import { BranchDashboardSpotlightTutorialSteps } from "@/app/src/data/modules/dashboard/BranchDashboardSpotlightTutorialData";
import { useBranchDashboardSpotlightTutorial } from "@/app/src/hooks/modules/dashboard/useBranchDashboardSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/SpotlightTour";

export function BranchDashboardSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } =
    useBranchDashboardSpotlightTutorial();

  return (
    <SpotlightTour
      appearance="light"
      ariaLabel="Branch dashboard tutorial"
      badge={
        <SpotlightTourBadge appearance="light">
          Branch dashboard guide
        </SpotlightTourBadge>
      }
      isOpen={isOpen}
      steps={BranchDashboardSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
