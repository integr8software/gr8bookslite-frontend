"use client";

import {
  ChartsOfAccountsSpotlightTutorialSteps,
} from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsSpotlightTutorialData";
import { useChartsOfAccountsSpotlightTutorial } from "@/app/src/hooks/modules/maintenance/financial-management/charts-of-accounts/useChartsOfAccountsSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function ChartsOfAccountsSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } =
    useChartsOfAccountsSpotlightTutorial();

  return (
    <SpotlightTour
      ariaLabel="Chart of accounts tutorial"
      badge={
        <SpotlightTourBadge>
          Charts of accounts guide
        </SpotlightTourBadge>
      }
      isOpen={isOpen}
      steps={ChartsOfAccountsSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
