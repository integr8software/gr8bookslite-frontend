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
  MaintenanceAddDrawerSpotlightTutorialCloseEvent,
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
      const listStepCount = createMaintenanceSpotlightTutorialSteps(
        config?.label ?? "",
      ).length;

      if (
        listConfig?.addMode === "drawer" &&
        index === listStepCount
      ) {
        window.dispatchEvent(
          new Event(MaintenanceAddDrawerSpotlightTutorialOpenEvent),
        );
      }

      if (listConfig?.addMode === "drawer" && index === listStepCount - 1) {
        closeMaintenanceAddDrawer();
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
        closeMaintenanceAddDrawer();
        completeTutorial();

        if (listConfig?.addMode === "route") {
          router.push(`${listConfig.href}/add`);
        }
      }}
      onSkip={() => {
        closeMaintenanceAddDrawer();
        skipTutorial();
      }}
    />
  );
}

function closeMaintenanceAddDrawer() {
  window.dispatchEvent(
    new Event(MaintenanceAddDrawerSpotlightTutorialCloseEvent),
  );
}
