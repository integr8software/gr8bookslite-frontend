"use client";

import { DepartmentSpotlightTutorialSteps } from "@/app/src/data/modules/system-administration/user-management/department/DepartmentSpotlightTutorialData";
import { useDepartmentSpotlightTutorial } from "@/app/src/hooks/modules/system-administration/user-management/department/useDepartmentSpotlightTutorial";
import {
	SpotlightTour,
	SpotlightTourBadge,
} from "@/app/src/ui/shared/SpotlightTour";

export function DepartmentSpotlightTutorial() {
	const { completeTutorial, isOpen, skipTutorial } =
		useDepartmentSpotlightTutorial();

	return (
		<SpotlightTour
			appearance="light"
			ariaLabel="User group tutorial"
			badge={
				<SpotlightTourBadge appearance="light">
					User group guide
				</SpotlightTourBadge>
			}
			isOpen={isOpen}
			steps={DepartmentSpotlightTutorialSteps}
			onComplete={completeTutorial}
			onSkip={skipTutorial}
		/>
	);
}
