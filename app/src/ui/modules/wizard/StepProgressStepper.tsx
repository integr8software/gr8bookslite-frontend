"use client";

import { Check } from "lucide-react";
import { ModulesWizardSteps } from "@/app/src/data/modules/wizard/ModulesWizardData";

type StepProgressStepperProps = {
	stepIndex: number;
	onSelectStep: (stepIndex: number) => void;
};

export function StepProgressStepper({
	stepIndex,
	onSelectStep,
}: StepProgressStepperProps) {
	return (
		<section className="flex flex-col items-center py-2 w-full">
			<div className="flex w-full max-w-7xl items-start">
				{ModulesWizardSteps.map((step, index) => {
					const isActive = index === stepIndex;
					const isComplete = index < stepIndex;
					return (
						<button
							key={step.id}
							type="button"
							onClick={() => onSelectStep(index)}
							className="relative flex flex-1 flex-col items-center focus-visible:outline-none"
						>
							{isComplete && (
								<span className="absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-4.5 h-px bg-darknavy" />
							)}
							<StepIcon
								step={step}
								isActive={isActive}
								isComplete={isComplete}
							/>
							<span className="mt-2 flex flex-col items-center text-center">
								<span className="text-[10px] font-semibold uppercase tracking-widest text-darknavy/40">
									{step.eyebrow}
								</span>
								<span
									className={`mt-0.5 text-xs font-semibold leading-tight ${isActive ? "text-darknavy" : "text-darknavy/45"}`}
								>
									{step.title}
								</span>
							</span>
						</button>
					);
				})}
			</div>
		</section>
	);
}

function StepIcon({
	step,
	isActive,
	isComplete,
}: {
	step: (typeof ModulesWizardSteps)[number];
	isActive: boolean;
	isComplete: boolean;
}) {
	const Icon = step.icon;
	return (
		<span
			className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
				isComplete
					? "border-darknavy bg-darknavy/10 text-darknavy"
					: isActive
						? "border-darknavy bg-darknavy text-white shadow-[0_0_0_4px_rgba(100,180,255,0.2)]"
						: "border-darknavy/10 bg-white text-darknavy/40"
			}`}
		>
			{isComplete ? (
				<Check className="h-4 w-4" />
			) : (
				<Icon className="h-4 w-4" />
			)}
		</span>
	);
}
