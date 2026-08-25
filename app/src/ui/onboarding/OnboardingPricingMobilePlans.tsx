"use client";

import { Check, LoaderCircle, MoveRight } from "lucide-react";
import {
	type BillingCycle,
	type PricingPlan,
} from "@/app/src/data/pricing/PricingTypes";
import { OnboardingPlanComparisonRows } from "@/app/src/data/onboarding/OnboardingData";

type OnboardingPricingMobilePlansProps = {
	plans: PricingPlan[];
	billingCycle: BillingCycle;
	isSubmitting: boolean;
	submittingPlanCode: string | null;
	onReviewPlans: () => void;
	onSelectPlan: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function OnboardingPricingMobilePlans({
	plans,
	billingCycle,
	isSubmitting,
	submittingPlanCode,
	onReviewPlans,
	onSelectPlan,
}: OnboardingPricingMobilePlansProps) {
	const visiblePlans = plans.filter(
		(plan) => plan.name !== "Additional Company",
	);

	return (
		<div className="space-y-6 p-4 sm:p-6 lg:hidden">
			<div className="rounded-3xl border border-darknavy/10 bg-linear-to-br from-offwhite to-white p-6 text-center">
				<p className="text-sm font-semibold text-darknavy">
					Need help choosing?
				</p>
				<p className="mt-3 text-sm leading-6 text-darknavy/60">
					Start with a 15-days free trial now and pick the plan that
					best matches your current workflow and reporting needs.
				</p>
				<button
					type="button"
					onClick={onReviewPlans}
					disabled={isSubmitting}
					className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-skyblue transition hover:text-darknavy"
				>
					Review plans
					<MoveRight className="h-4 w-4" />
				</button>
			</div>

			<div className="space-y-4">
				{visiblePlans.map((plan, planIndex) => {
					const isHighlighted = plan.highlighted;
					const price =
						billingCycle === "monthly"
							? plan.monthlyPrice
							: plan.yearlyPrice;
					const compareAtPrice =
						billingCycle === "monthly"
							? plan.monthlyCompareAtPrice
							: plan.yearlyCompareAtPrice;
					const billingLabel = plan.billingLabel[billingCycle];
					const isSubmittingThisPlan =
						isSubmitting && submittingPlanCode === plan.code;

					return (
						<article
							key={plan.name}
							className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${
								isHighlighted
									? "border-skyblue/40 bg-white shadow-[0_16px_34px_rgba(33,39,56,0.14)]"
									: "border-darknavy/10 bg-white"
							}`}
						>
							{isHighlighted ? (
								<div
									className="absolute right-3 top-0 flex h-13 w-10 flex-col items-center justify-center bg-citron pt-0.5 text-[9px] font-black uppercase leading-tight tracking-[0.06em] text-darknavy shadow-xs"
									style={{
										clipPath:
											"polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)",
									}}
								>
									<span>20%</span>
									<span>Off</span>
								</div>
							) : (
								<div className="mb-4 h-6" />
							)}

							<div className="mt-4 text-center">
								<h4 className="px-7 text-2xl font-semibold text-darknavy">
									{plan.name}
								</h4>
								{plan.description ? (
									<p className="mt-2 text-xs leading-relaxed text-darknavy/60">
										{plan.description}
									</p>
								) : null}
								<div className="mt-4">
									{compareAtPrice ? (
										<p className="text-sm text-darknavy/35 line-through">
											{compareAtPrice}
										</p>
									) : null}
									<div className="mt-1 flex items-end justify-center gap-1 whitespace-nowrap">
										<p className="text-4xl font-semibold tracking-tight text-darknavy">
											{price}
										</p>
										<span className="pb-1 text-sm font-medium text-darknavy/65">
											{billingCycle === "monthly"
												? "/month"
												: "/year"}
										</span>
									</div>
									<p className="mt-1 text-sm text-darknavy/60">
										{billingLabel}
									</p>
								</div>
							</div>

							{isHighlighted ? (
								<div className="mt-5 text-center">
									<span className="rounded-full bg-skyblue/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-800">
										Most popular
									</span>
								</div>
							) : null}

							<div className="mt-6 space-y-3 rounded-2xl bg-offwhite/60 p-4 text-center">
								{OnboardingPlanComparisonRows.map((row) => {
									const fallbackValue = row.values[planIndex];
									const value =
										row.label === "Best for" && plan.description
											? plan.description
											: fallbackValue;

									return (
										<div
											key={`${plan.name}-${row.label}`}
											className="flex flex-col items-center gap-2 text-sm"
										>
											<span className="text-darknavy/60">
												{row.label}
											</span>
											<span className="font-medium text-darknavy">
												{typeof value === "boolean" ? (
													value ? (
														<span className="inline-flex h-6 w-6 items-center justify-center text-green-700">
															<Check className="h-4 w-4" />
														</span>
													) : (
														<span className="text-darknavy/30">
															-
														</span>
													)
												) : (
													value ?? "-"
												)}
											</span>
										</div>
									);
								})}
							</div>

							<button
								type="button"
								onClick={() => onSelectPlan(plan, billingCycle)}
								disabled={isSubmitting}
								className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition ${
									isHighlighted
										? "border-sky-600 bg-sky-600 text-white hover:border-sky-700 hover:bg-sky-700"
										: "border-darknavy/10 bg-white text-darknavy hover:border-skyblue hover:bg-offwhite"
								} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								Choose plan
								{isSubmittingThisPlan ? (
									<LoaderCircle
										className="h-5 w-5 animate-spin"
										aria-hidden="true"
									/>
								) : null}
							</button>
						</article>
					);
				})}
			</div>
		</div>
	);
}
