"use client";

import { Check, LoaderCircle, MoveRight } from "lucide-react";
import {
	type BillingCycle,
	type PricingPlan,
} from "@/app/src/data/pricing/PricingTypes";
import { OnboardingPlanComparisonRows } from "@/app/src/data/onboarding/OnboardingData";

type OnboardingPricingDesktopPlansProps = {
	plans: PricingPlan[];
	billingCycle: BillingCycle;
	isSubmitting: boolean;
	submittingPlanCode: string | null;
	onReviewPlans: () => void;
	onSelectPlan: (plan: PricingPlan, billingCycle: BillingCycle) => void;
};

export function OnboardingPricingDesktopPlans({
	plans,
	billingCycle,
	isSubmitting,
	submittingPlanCode,
	onReviewPlans,
	onSelectPlan,
}: OnboardingPricingDesktopPlansProps) {
	const visiblePlans = plans.filter(
		(plan) => plan.name !== "Additional Company",
	);
	const pricingGridStyle = {
		gridTemplateColumns: `minmax(220px, 1.2fr) repeat(${visiblePlans.length}, minmax(0, 1fr))`,
	};

	return (
		<div className="hidden lg:block">
			<div className="min-w-0">
				<div
					className="grid border-b border-darknavy/10"
					style={pricingGridStyle}
				>
					<div className="border-r border-darknavy/10 bg-linear-to-br from-offwhite to-white p-6 sm:p-8">
						<div className="max-w-xs">
							<p className="text-sm font-semibold text-darknavy">
								Need help choosing?
							</p>
							<p className="mt-3 text-sm leading-6 text-darknavy/60">
								Start with your free trial now and pick the plan
								that best matches your current workflow and
								reporting needs.
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
					</div>

					{visiblePlans.map((plan) => {
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
							<div
								key={plan.name}
								className={`relative flex h-full flex-col px-6 pb-7 pt-8 text-center sm:px-8 ${
									isHighlighted
										? "rounded-xl border border-skyblue/35 bg-white shadow-[0_16px_34px_rgba(33,39,56,0.16)]"
										: "border-r border-darknavy/10 bg-white last:border-r-0"
								}`}
							>
								{isHighlighted ? (
									<div
										className="absolute right-4 top-0 flex h-16 w-12 flex-col items-center justify-center bg-citron pt-1 text-[10px] font-black uppercase leading-tight tracking-[0.08em] text-darknavy"
										style={{
											clipPath:
												"polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)",
										}}
									>
										<span>20%</span>
										<span>Off</span>
									</div>
								) : null}

								<div className="flex min-h-43 flex-col justify-center">
									<h4 className="mx-auto max-w-52 text-xl font-semibold leading-tight text-darknavy">
										{plan.name}
									</h4>
									<div className="mt-3 space-y-1">
										{compareAtPrice ? (
											<p className="text-xs text-darknavy/35 line-through">
												{compareAtPrice}
											</p>
										) : null}
										<div className="flex items-end justify-center gap-1 whitespace-nowrap">
											<p className="text-2xl font-semibold tracking-tight text-darknavy">
												{price}
											</p>
											<span className="pb-0.5 text-xs font-medium text-darknavy/55">
												{billingCycle === "monthly"
													? "/month"
													: "/year"}
											</span>
										</div>
										<p className="text-xs text-darknavy/50">
											{billingLabel}
										</p>
									</div>
								</div>

								{isHighlighted ? (
									<span className="mb-3 self-center rounded-full bg-skyblue/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-800">
										Most popular
									</span>
								) : null}

								<button
									type="button"
									onClick={() =>
										onSelectPlan(plan, billingCycle)
									}
									disabled={isSubmitting}
									className={`mt-auto inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
										isHighlighted
											? "w-full border-sky-600 bg-sky-600 text-white shadow-sm hover:border-sky-700 hover:bg-sky-700"
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
							</div>
						);
					})}
				</div>

				{OnboardingPlanComparisonRows.map((row, rowIndex) => (
					<div
						key={row.label}
						className={`grid ${
							rowIndex !== OnboardingPlanComparisonRows.length - 1
								? "border-b border-darknavy/10"
								: ""
						}`}
						style={pricingGridStyle}
					>
						<div className="border-r border-darknavy/10 bg-offwhite/45 px-6 py-5 text-sm font-medium text-darknavy sm:px-8">
							{row.label}
						</div>

						{row.values
							.slice(0, visiblePlans.length)
							.map((value, valueIndex) => (
								<div
									key={`${row.label}-${visiblePlans[valueIndex]?.name}`}
									className={`flex items-center justify-center border-r border-darknavy/10 px-6 py-5 text-center text-sm text-darknavy/75 last:border-r-0 ${
										visiblePlans[valueIndex]?.highlighted
											? "bg-[#f5fffb]"
											: "bg-white"
									}`}
								>
									{typeof value === "boolean" ? (
										value ? (
											<span className="inline-flex h-6 w-6 items-center justify-center text-green-700">
												<Check className="h-4 w-4" />
											</span>
										) : (
											<span className="text-base font-semibold text-darknavy/30">
												-
											</span>
										)
									) : (
										value
									)}
								</div>
							))}
					</div>
				))}
			</div>
		</div>
	);
}
