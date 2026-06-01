"use client";

import {
  WorkspaceCompanySpotlightTutorialOpenEvent,
  WorkspaceCompanySpotlightTutorialSteps,
  WorkspaceCompanySpotlightTutorialStorageKey,
} from "@/app/src/data/workspace/companies/WorkspaceCompanySpotlightTutorialData";
import { WorkspaceCompaniesHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function WorkspaceCompanySpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: WorkspaceCompaniesHref,
    openEvent: WorkspaceCompanySpotlightTutorialOpenEvent,
    storageKey: WorkspaceCompanySpotlightTutorialStorageKey,
  });

  return (
    <SpotlightTour
      ariaLabel="Workspace company management tutorial"
      badge={<SpotlightTourBadge>Company management guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={WorkspaceCompanySpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
