"use client";

import type {
	BillingCycle,
	PricingPlan,
} from "@/app/src/data/pricing/PricingData";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";

type OnboardingBillingSummaryCardProps = {
	billingMode: BillingMode;
	selectedPlan: PricingPlan | null;
	selectedBillingCycle: BillingCycle;
};

export function OnboardingBillingSummaryCard({
	billingMode,
	selectedPlan,
	selectedBillingCycle,
}: OnboardingBillingSummaryCardProps) {
	const selectedPrice = selectedPlan
		? selectedBillingCycle === "monthly"
			? selectedPlan.monthlyPrice
			: selectedPlan.yearlyPrice
		: null;
	const billingLabel =
		selectedBillingCycle === "yearly"
			? "Yearly billing"
			: "Monthly billing";
	const cadenceLabel =
		selectedBillingCycle === "yearly"
			? "Charged once a year"
			: "Charged every month";
	const renewalLabel =
		billingMode === "MANUAL"
			? "You will renew manually through hosted checkout."
			: selectedBillingCycle === "yearly"
			? "Renews yearly after your free trial ends."
			: "Renews monthly after your free trial ends.";

	return (
		<aside className="overflow-hidden rounded-2xl border border-skyblue/30 bg-white text-darknavy shadow-[0_20px_50px_rgba(33,39,56,0.12)]">
			<div className="bg-[radial-gradient(circle_at_90%_0%,rgba(87,196,229,0.42),transparent_42%),linear-gradient(145deg,#dff4fc_0%,#edf9fd_56%,#d4eff9_100%)] p-6 sm:p-7">
				<h3 className="text-2xl font-semibold tracking-tight">
					{selectedPlan?.name ?? "No plan selected yet"}
				</h3>

				<div className="mt-7 flex items-end justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/45">
							After your trial
						</p>
						<p className="mt-2 whitespace-nowrap text-4xl font-semibold tracking-[-0.04em]">
							{selectedPrice ?? "Choose a plan"}
						</p>
						<p className="mt-1.5 text-sm text-darknavy/55">
							{cadenceLabel}
						</p>
					</div>
					<span className="mb-1 rounded-full bg-citron px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-darknavy">
						15 days free
					</span>
				</div>
			</div>

			<div className="p-6 sm:p-7">
				<dl className="divide-y divide-darknavy/10">
					<div className="flex items-center justify-between gap-5 pb-4 text-sm">
						<dt className="text-darknavy/45">Plan</dt>
						<dd className="text-right font-semibold text-darknavy">
							{selectedPlan?.name ?? "Pending selection"}
						</dd>
					</div>
					<div className="flex items-center justify-between gap-5 py-4 text-sm">
						<dt className="text-darknavy/45">Billing cycle</dt>
						<dd className="text-right font-semibold text-darknavy">
							{billingLabel}
						</dd>
					</div>
					<div className="flex items-start justify-between gap-5 pt-4 text-sm">
						<dt className="text-darknavy/45">Billing method</dt>
						<dd className="max-w-52 text-right font-semibold text-darknavy">
							{billingMode === "MANUAL"
								? "Manual payment"
								: "Auto renewal"}
						</dd>
					</div>
					<div className="flex items-start justify-between gap-5 pt-4 text-sm">
						<dt className="text-darknavy/45">Next payment</dt>
						<dd className="max-w-52 text-right leading-6 text-darknavy/65">
							{renewalLabel}
						</dd>
					</div>
				</dl>

				<p className="mt-6 rounded-xl bg-skyblue/10 p-4 text-xs leading-5 text-darknavy/60">
					{billingMode === "MANUAL"
						? "No payment method is saved. Manual checkout is confirmed by backend webhook in Phase 2."
						: "No charge today. Your card is charged only after the free trial ends."}
				</p>
			</div>
		</aside>
	);
}
