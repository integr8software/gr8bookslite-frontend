"use client";

import { ModulesWizardSteps } from "@/app/src/data/modules/wizard/ModulesWizardData";

type PanelHeaderProps = {
	currentStep: (typeof ModulesWizardSteps)[number];
};

export function PanelHeader({ currentStep }: PanelHeaderProps) {
	return (
		<header className="mb-6">
			<h1 className="text-xl font-bold text-darknavy">
				{currentStep.title}
			</h1>
			<p className="mt-2 text-sm text-darknavy/70">
				{currentStep.description}
			</p>
		</header>
	);
}
