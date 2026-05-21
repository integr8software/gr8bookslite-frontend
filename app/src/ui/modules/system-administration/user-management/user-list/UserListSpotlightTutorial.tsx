"use client";

import { UserListSpotlightTutorialSteps } from "@/app/src/data/modules/system-administration/user-management/user-list/UserListSpotlightTutorialData";
import { useUserListSpotlightTutorial } from "@/app/src/hooks/modules/system-administration/user-management/user-list/useUserListSpotlightTutorial";
import {
  SpotlightTour,
  SpotlightTourBadge,
} from "@/app/src/ui/shared/SpotlightTour";

export function UserListSpotlightTutorial() {
  const { completeTutorial, isOpen, skipTutorial } =
    useUserListSpotlightTutorial();

  return (
    <SpotlightTour
      ariaLabel="User management tutorial"
      badge={<SpotlightTourBadge>User management guide</SpotlightTourBadge>}
      isOpen={isOpen}
      steps={UserListSpotlightTutorialSteps}
      onComplete={completeTutorial}
      onSkip={skipTutorial}
    />
  );
}
