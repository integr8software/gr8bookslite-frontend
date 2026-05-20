"use client";

import { UserTypeSpotlightTutorialSteps } from "@/app/src/data/modules/system-administration/user-management/user-type/UserTypeSpotlightTutorialData";
import { useUserTypeSpotlightTutorial } from "@/app/src/hooks/modules/system-administration/user-management/user-type/useUserTypeSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/SpotlightTour";

export function UserTypeSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } =
    useUserTypeSpotlightTutorial();

  return (
    <SpotlightTour
      ariaLabel="User type tutorial"
      badge={<SpotlightTourBadge>User type guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={UserTypeSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
