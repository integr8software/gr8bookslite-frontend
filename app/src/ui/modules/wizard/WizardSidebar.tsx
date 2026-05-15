"use client";

import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ModulesWizardSteps } from "@/app/src/data/modules/wizard/ModulesWizardData";

type WizardSidebarProps = {
	stepIndex: number;
	onSelectStep: (stepIndex: number) => void;
};

export function WizardSidebar({ stepIndex, onSelectStep }: WizardSidebarProps) {
	return (
		<aside className="rounded-lg border border-darknavy/40 bg-white p-3 shadow-sm">
			<div className="grid gap-2">
				{ModulesWizardSteps.map((step, index) => {
					const isActive = index === stepIndex;
					const isComplete = index < stepIndex;
					return (
						<button
							key={step.id}
							type="button"
							onClick={() => onSelectStep(index)}
							className={`flex min-h-20 w-full items-center gap-3 rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/35 ${
								isActive
									? "border-darknavy/45 bg-darknavy/10"
									: "border-transparent hover:border-darknavy/10 hover:bg-darknavy/3"
							}`}
						>
							<SidebarIcon
								isComplete={isComplete}
								icon={step.icon}
							/>
							<span className="min-w-0">
								<span className="block text-xs font-semibold uppercase text-darknavy/45">
									{step.eyebrow}
								</span>
								<span className="block truncate text-sm font-semibold text-darknavy">
									{step.title}
								</span>
								<span className="mt-1 block text-xs leading-4 text-darknavy/55">
									{step.description}
								</span>
							</span>
						</button>
					);
				})}
			</div>
		</aside>
	);
}

function SidebarIcon({
	isComplete,
	icon,
}: {
	isComplete: boolean;
	icon: LucideIcon;
}) {
	const Icon = icon;
	return (
		<span
			className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${isComplete ? "bg-citron/25 text-darknavy" : "bg-darknavy/6 text-darknavy/65"}`}
		>
			{isComplete ? (
				<Check className="h-5 w-5" aria-hidden="true" />
			) : (
				<Icon className="h-5 w-5" aria-hidden="true" />
			)}
		</span>
	);
}
