"use client";

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
  const configLabel = config?.label ?? "";
  const includeCreateStep = config?.includeCreateStep !== false;
  const includeFiltersStep = config?.includeFiltersStep !== false;
  const includeTableStep = config?.includeTableStep !== false;
  const listAddMode = listConfig?.addMode;
  const tutorialHref = addConfig ? `${href}/add` : href;
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: tutorialHref,
    openEvent: addConfig
      ? MaintenanceAddSpotlightTutorialOpenEvent
      : MaintenanceSpotlightTutorialOpenEvent,
    storageKey: createMaintenanceSpotlightTutorialStorageKey(tutorialHref),
  });
  function handleStepEnter(_: unknown, index: number) {
    const listStepCount = createMaintenanceSpotlightTutorialSteps(
      configLabel,
      includeCreateStep,
      includeFiltersStep,
      includeTableStep,
    ).length;

    if (listAddMode === "drawer" && index === listStepCount) {
      window.dispatchEvent(
        new Event(MaintenanceAddDrawerSpotlightTutorialOpenEvent),
      );
    }

    if (listAddMode === "drawer" && index === listStepCount - 1) {
      closeMaintenanceAddDrawer();
    }
  }

  if (!config) {
    return null;
  }

  return (
    <SpotlightTour
      ariaLabel={`${config.label} tutorial`}
      badge={
        <SpotlightTourBadge>
          {href.startsWith("/maintenance/") ? "Maintenance guide" : "Module guide"}
        </SpotlightTourBadge>
      }
      isOpen={isOpen}
      steps={
        addConfig
          ? createMaintenanceAddSpotlightTutorialSteps(config.label)
          : listConfig?.addMode === "drawer"
            ? createMaintenanceDrawerSpotlightTutorialSteps(config.label)
          : createMaintenanceSpotlightTutorialSteps(
              config.label,
              includeCreateStep,
              includeFiltersStep,
              includeTableStep,
            )
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
