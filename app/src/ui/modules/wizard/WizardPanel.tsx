"use client";

import { useModulesWizard } from "@/app/src/hooks/modules/wizard/useModulesWizard";
import { PanelHeader } from "./PanelHeader";
import { PanelBody } from "./PanelBody";
import { PanelFooter } from "./PanelFooter";

export function WizardPanel({
	wizard,
}: {
	wizard: ReturnType<typeof useModulesWizard>;
}) {
	return (
		<div className="rounded-lg border border-darknavy/40 bg-white p-4 shadow-sm sm:p-5">
			<PanelHeader currentStep={wizard.currentStep} />
			<PanelBody wizard={wizard} />
			<PanelFooter wizard={wizard} />
		</div>
	);
}
