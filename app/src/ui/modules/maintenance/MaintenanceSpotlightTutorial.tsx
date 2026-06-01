"use client";

import { usePathname } from "next/navigation";
import {
  createMaintenanceSpotlightTutorialSteps,
  createMaintenanceSpotlightTutorialStorageKey,
  getMaintenanceSpotlightTutorialConfig,
  MaintenanceSpotlightTutorialOpenEvent,
} from "@/app/src/data/modules/maintenance/MaintenanceSpotlightTutorialData";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function MaintenanceSpotlightTutorial() {
  const pathname = usePathname();
  const config = getMaintenanceSpotlightTutorialConfig(pathname);
  const href = config?.href ?? "";
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href,
    openEvent: MaintenanceSpotlightTutorialOpenEvent,
    storageKey: createMaintenanceSpotlightTutorialStorageKey(href),
  });

  if (!config) {
    return null;
  }

  return (
    <SpotlightTour
      ariaLabel={`${config.label} tutorial`}
      badge={<SpotlightTourBadge>Maintenance guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={createMaintenanceSpotlightTutorialSteps(config.label)}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
