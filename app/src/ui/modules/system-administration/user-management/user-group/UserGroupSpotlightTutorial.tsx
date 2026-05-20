"use client";

import { UserGroupSpotlightTutorialSteps } from "@/app/src/data/modules/system-administration/user-management/user-group/UserGroupSpotlightTutorialData";
import { useUserGroupSpotlightTutorial } from "@/app/src/hooks/modules/system-administration/user-management/user-group/useUserGroupSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/SpotlightTour";

export function UserGroupSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } =
    useUserGroupSpotlightTutorial();

  return (
    <SpotlightTour
      ariaLabel="User group tutorial"
      badge={<SpotlightTourBadge>User group guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={UserGroupSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
