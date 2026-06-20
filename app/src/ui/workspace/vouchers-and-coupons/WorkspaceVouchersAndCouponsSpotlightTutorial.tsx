"use client";

import { WorkspaceVouchersAndCouponsHref } from "@/app/src/constants/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsConstants";
import {
  WorkspaceVouchersAndCouponsSpotlightTutorialOpenEvent,
  WorkspaceVouchersAndCouponsSpotlightTutorialSteps,
  WorkspaceVouchersAndCouponsSpotlightTutorialStorageKey,
} from "@/app/src/data/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsSpotlightTutorialData";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function WorkspaceVouchersAndCouponsSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: WorkspaceVouchersAndCouponsHref,
    openEvent: WorkspaceVouchersAndCouponsSpotlightTutorialOpenEvent,
    storageKey: WorkspaceVouchersAndCouponsSpotlightTutorialStorageKey,
  });

  return (
    <SpotlightTour
      ariaLabel="Workspace vouchers and coupons tutorial"
      badge={<SpotlightTourBadge>Vouchers and coupons guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={WorkspaceVouchersAndCouponsSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
