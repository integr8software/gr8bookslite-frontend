"use client";

import { useCallback } from "react";
import { MaintenanceAddDrawerSpotlightTutorialOpenEvent } from "@/app/src/data/modules/maintenance/MaintenanceSpotlightTutorialData";
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
  const handleStepEnter = useCallback((_: unknown, index: number) => {
    if (index === 5) {
      window.dispatchEvent(
        new Event(MaintenanceAddDrawerSpotlightTutorialOpenEvent),
      );
    }
  }, []);

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
      onStepEnter={handleStepEnter}
      onSkip={skipTutorial}
    />
  );
}
