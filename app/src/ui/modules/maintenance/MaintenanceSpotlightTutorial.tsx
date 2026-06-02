"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  createMaintenanceAddSpotlightTutorialSteps,
  createMaintenanceDrawerSpotlightTutorialSteps,
  createMaintenanceSpotlightTutorialSteps,
  createMaintenanceSpotlightTutorialStorageKey,
  getMaintenanceAddSpotlightTutorialConfig,
  getMaintenanceSpotlightTutorialConfig,
  MaintenanceAddSpotlightTutorialOpenEvent,
  MaintenanceAddDrawerSpotlightTutorialOpenEvent,
  MaintenanceSpotlightTutorialOpenEvent,
} from "@/app/src/data/modules/maintenance/MaintenanceSpotlightTutorialData";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function MaintenanceSpotlightTutorial() {
  const pathname = usePathname();
  const router = useRouter();
  const addConfig = getMaintenanceAddSpotlightTutorialConfig(pathname);
  const listConfig = getMaintenanceSpotlightTutorialConfig(pathname);
  const config = addConfig ?? listConfig;
  const href = config?.href ?? "";
  const tutorialHref = addConfig ? `${href}/add` : href;
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: tutorialHref,
    openEvent: addConfig
      ? MaintenanceAddSpotlightTutorialOpenEvent
      : MaintenanceSpotlightTutorialOpenEvent,
    storageKey: createMaintenanceSpotlightTutorialStorageKey(tutorialHref),
  });
  const handleStepEnter = useCallback(
    (_: unknown, index: number) => {
      if (
        listConfig?.addMode === "drawer" &&
        index === createMaintenanceSpotlightTutorialSteps(config?.label ?? "").length
      ) {
        window.dispatchEvent(
          new Event(MaintenanceAddDrawerSpotlightTutorialOpenEvent),
        );
      }
    },
    [config?.label, listConfig?.addMode],
  );

  if (!config) {
    return null;
  }

  return (
    <SpotlightTour
      ariaLabel={`${config.label} tutorial`}
      badge={<SpotlightTourBadge>Maintenance guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={
        addConfig
          ? createMaintenanceAddSpotlightTutorialSteps(config.label)
          : listConfig?.addMode === "drawer"
            ? createMaintenanceDrawerSpotlightTutorialSteps(config.label)
          : createMaintenanceSpotlightTutorialSteps(config.label)
      }
      onStepEnter={handleStepEnter}
      onComplete={() => {
        completeTutorial();

        if (listConfig?.addMode === "route") {
          router.push(`${listConfig.href}/add`);
        }
      }}
      onSkip={skipTutorial}
    />
  );
}
