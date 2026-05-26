import type {
	MasterCompanyBillingCycle,
	MasterCompanySubscriptionPlan,
	MasterCompanySubscriptionStatus,
} from "@/app/src/types/master/company-management/MasterCompanyManagementTypes";

export function MasterCompanyPlanBadge({
	plan,
}: {
	plan: MasterCompanySubscriptionPlan;
}) {
	const className =
		plan === "Accounting + Inventory"
			? "bg-darknavy text-white"
			: plan === "Accounting"
				? "bg-skyblue/18 text-darknavy"
				: "bg-citron/45 text-darknavy";

	return (
		<span className={`rounded-md px-3 py-1 text-xs font-semibold ${className}`}>
			{plan}
		</span>
	);
}

export function MasterCompanyStatusBadge({
	status,
}: {
	status: MasterCompanySubscriptionStatus;
}) {
	const className =
		status === "Active"
			? "border-emerald-200 bg-emerald-50 text-emerald-700"
			: status === "Trial"
				? "border-skyblue/25 bg-skyblue/12 text-darknavy"
				: status === "Past Due"
					? "border-coralpink/25 bg-coralpink/10 text-coralpink"
					: "border-darknavy/10 bg-darknavy/5 text-darknavy/55";

	return (
		<span
			className={`rounded-md border px-3 py-1 text-xs font-semibold ${className}`}
		>
			{status}
		</span>
	);
}

export function MasterCompanyCycleBadge({
	billingCycle,
}: {
	billingCycle: MasterCompanyBillingCycle;
}) {
	return (
		<span className="rounded-md bg-offwhite px-3 py-1 text-xs font-semibold text-darknavy/65 ring-1 ring-darknavy/10">
			{billingCycle}
		</span>
	);
}
