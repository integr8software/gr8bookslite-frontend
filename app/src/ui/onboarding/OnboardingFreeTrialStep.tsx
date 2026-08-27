"use client";

import { useRef, useState } from "react";
import { BillingOptions } from "@/app/src/data/pricing/PricingData";
import type {
	BillingCycle,
	PricingPlan,
} from "@/app/src/types/pricing/PricingTypes";
import { OnboardingPricingDesktopPlans } from "@/app/src/ui/onboarding/OnboardingPricingDesktopPlans";
import { OnboardingPricingHero } from "@/app/src/ui/onboarding/OnboardingPricingHero";
import { OnboardingPricingMobilePlans } from "@/app/src/ui/onboarding/OnboardingPricingMobilePlans";

type OnboardingFreeTrialStepProps = {
	plans: PricingPlan[];
	handlePlanSelection: (
		plan: PricingPlan,
		billingCycle: BillingCycle,
	) => void;
	isSubmitting: boolean;
	submittingPlanCode: string | null;
};

export function OnboardingFreeTrialStep({
	plans,
	handlePlanSelection,
	isSubmitting,
	submittingPlanCode,
}: OnboardingFreeTrialStepProps) {
	const pricingSectionRef = useRef<HTMLElement | null>(null);
	const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

	function scrollToPricing() {
		pricingSectionRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	}

	return (
		<div className="space-y-8">
			<OnboardingPricingHero onReviewPlans={scrollToPricing} />

			<section
				ref={pricingSectionRef}
				className="scroll-mt-8 overflow-hidden rounded-2xl border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.08)]"
			>
				<div className="border-b border-darknavy/10 bg-offwhite/50 px-6 py-8 sm:px-8">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-2xl">
							<h3 className="text-3xl font-semibold tracking-tight text-darknavy">
								Compare plans before you continue
							</h3>
							<p className="mt-3 text-sm leading-6 text-darknavy/65 sm:text-base">
								Each plan begins with a free trial. Choose the
								setup that fits your team best, then we&apos;ll
								take you to billing.
							</p>
						</div>

						<div className="inline-flex w-fit rounded-full border border-darknavy/15 bg-white p-1 shadow-sm">
							{BillingOptions.map((option) => {
								const isActive = billingCycle === option.value;

								return (
									<button
										key={option.value}
										type="button"
										onClick={() =>
											setBillingCycle(option.value)
										}
										disabled={isSubmitting}
										className={`rounded-full px-5 py-2 text-sm font-medium transition ${
											isActive
												? "bg-darknavy text-offwhite"
												: "text-darknavy/70 hover:bg-darknavy/5"
										} disabled:cursor-not-allowed disabled:opacity-60`}
									>
										{option.label}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				<OnboardingPricingMobilePlans
					plans={plans}
					billingCycle={billingCycle}
					isSubmitting={isSubmitting}
					submittingPlanCode={submittingPlanCode}
					onReviewPlans={scrollToPricing}
					onSelectPlan={handlePlanSelection}
				/>

				<OnboardingPricingDesktopPlans
					plans={plans}
					billingCycle={billingCycle}
					isSubmitting={isSubmitting}
					submittingPlanCode={submittingPlanCode}
					onReviewPlans={scrollToPricing}
					onSelectPlan={handlePlanSelection}
				/>
			</section>
		</div>
	);
}
