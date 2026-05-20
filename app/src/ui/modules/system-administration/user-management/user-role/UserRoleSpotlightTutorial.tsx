"use client";

import { UserRoleSpotlightTutorialSteps } from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorialData";
import { useUserRoleSpotlightTutorial } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useUserRoleSpotlightTutorial";
import {
	SpotlightTour,
	SpotlightTourBadge,
} from "@/app/src/ui/shared/SpotlightTour";

export function UserRoleSpotlightTutorial() {
	const { completeTutorial, isOpen, skipTutorial } =
		useUserRoleSpotlightTutorial();

	return (
		<SpotlightTour
			appearance="light"
			ariaLabel="User type tutorial"
			badge={
				<SpotlightTourBadge appearance="light">
					User type guide
				</SpotlightTourBadge>
			}
			isOpen={isOpen}
			steps={UserRoleSpotlightTutorialSteps}
			onComplete={completeTutorial}
			onSkip={skipTutorial}
		/>
	);
}
