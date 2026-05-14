"use client";

import { useModulesWizard } from "@/app/src/hooks/modules/wizard/useModulesWizard";
import { StepProgressStepper } from "@/app/src/ui/modules/wizard/StepProgressStepper";
import { WizardSidebar } from "@/app/src/ui/modules/wizard/WizardSidebar";
import { WizardPanel } from "@/app/src/ui/modules/wizard/WizardPanel";
import Image from "next/image";

export function ModulesWizardPage() {
	const wizard = useModulesWizard();

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-10">
			<Image
				src="/img/wizard.jpg"
				alt="wizard lvl5"
				width={200}
				height={200}
				className="rounded-full border-4 border-citron/50"
				priority
				aria-hidden="true"
			/>
			<StepProgressStepper
				stepIndex={wizard.stepIndex}
				onSelectStep={wizard.goToStep}
			/>
			<section className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
				<WizardSidebar
					stepIndex={wizard.stepIndex}
					onSelectStep={wizard.goToStep}
				/>
				<WizardPanel wizard={wizard} />
			</section>
		</div>
	);
}
