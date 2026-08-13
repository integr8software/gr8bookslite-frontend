"use client";

import { useCallback } from "react";
import {
  MaintenanceAddDrawerSpotlightTutorialCloseEvent,
  MaintenanceAddDrawerSpotlightTutorialOpenEvent,
} from "@/app/src/data/shared/tour/SpotlightTutorialData";
import { ChartsOfAccountsSpotlightTutorialSteps } from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsSpotlightTutorialData";
import { useChartsOfAccountsSpotlightTutorial } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartsOfAccountsSpotlightTutorial";
import { SpotlightTour, SpotlightTourBadge } from "@/app/src/ui/shared/tour/SpotlightTour";

export function ChartsOfAccountsSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } = useChartsOfAccountsSpotlightTutorial();
  const handleStepEnter = useCallback((_: unknown, index: number) => {
    if (index === 5) {
      window.dispatchEvent(new Event(MaintenanceAddDrawerSpotlightTutorialOpenEvent));
    }

    if (index === 4) {
      closeMaintenanceAddDrawer();
    }
  }, []);

  return (
    <SpotlightTour
      ariaLabel="Chart of accounts tutorial"
      badge={<SpotlightTourBadge>Charts of accounts guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={ChartsOfAccountsSpotlightTutorialSteps}
      onComplete={() => {
        closeMaintenanceAddDrawer();
        completeTutorial();
      }}
      onStepEnter={handleStepEnter}
      onSkip={() => {
        closeMaintenanceAddDrawer();
        skipTutorial();
      }}
    />
  );
}

function closeMaintenanceAddDrawer() {
  window.dispatchEvent(new Event(MaintenanceAddDrawerSpotlightTutorialCloseEvent));
}
