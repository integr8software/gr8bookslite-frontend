"use client";

import { WorkspaceBillingSubscriptionHref } from "@/app/src/constants/workspace/billing-and-subscription/WorkspaceBillingSubscriptionConstants";
import {
  WorkspaceBillingSpotlightTutorialOpenEvent,
  WorkspaceBillingSpotlightTutorialSteps,
  WorkspaceBillingSpotlightTutorialStorageKey,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSpotlightTutorialData";
import { useSpotlightTutorial } from "@/app/src/hooks/shared/tour/useSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/tour/SpotlightTour";

export function WorkspaceBillingSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } = useSpotlightTutorial({
    href: WorkspaceBillingSubscriptionHref,
    openEvent: WorkspaceBillingSpotlightTutorialOpenEvent,
    storageKey: WorkspaceBillingSpotlightTutorialStorageKey,
  });

  return (
    <SpotlightTour
      ariaLabel="Workspace billing and subscription tutorial"
      badge={<SpotlightTourBadge>Billing guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={WorkspaceBillingSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
