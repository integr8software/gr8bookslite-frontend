"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  WorkspaceCompanyAddHref,
  WorkspaceCompanyListSpotlightTutorialStepCount,
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
  const pathname = usePathname();
  const router = useRouter();
  const isAddPage = pathname === WorkspaceCompanyAddHref;
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: WorkspaceCompaniesHref,
    openEvent: WorkspaceCompanySpotlightTutorialOpenEvent,
    pathnamePrefixes: [WorkspaceCompanyAddHref],
    storageKey: WorkspaceCompanySpotlightTutorialStorageKey,
  });
  const handleStepEnter = useCallback(
    (_: unknown, index: number) => {
      if (!isAddPage && index === WorkspaceCompanyListSpotlightTutorialStepCount) {
        router.push(WorkspaceCompanyAddHref);
      }
    },
    [isAddPage, router],
  );

  return (
    <SpotlightTour
      ariaLabel="Workspace company management tutorial"
      badge={<SpotlightTourBadge>Company management guide</SpotlightTourBadge>}
      initialStepIndex={
        isAddPage ? WorkspaceCompanyListSpotlightTutorialStepCount : 0
      }
      isOpen={isOpen}
      steps={WorkspaceCompanySpotlightTutorialSteps}
      onComplete={completeTutorial}
      onStepEnter={handleStepEnter}
      onSkip={skipTutorial}
    />
  );
}
