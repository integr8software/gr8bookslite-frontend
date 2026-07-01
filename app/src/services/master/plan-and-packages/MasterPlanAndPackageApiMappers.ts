import type {
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageScaleRule,
	MasterPlanAndPackageStatus,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import type {
	CreateMasterPlanAndPackageRequest,
	MasterPlanAndPackageApiPrice,
	MasterPlanAndPackageApiRecord,
	MasterPlanAndPackageApiStatus,
	MasterPlanAndPackagesResponse,
} from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageApiTypes";

const StatusByApiStatus = {
	ACTIVE: "Active",
	DRAFT: "Draft",
	INACTIVE: "Inactive",
} as const satisfies Record<
	MasterPlanAndPackageApiStatus,
	MasterPlanAndPackageStatus
>;

const ApiStatusByStatus = {
	Active: "ACTIVE",
	Draft: "DRAFT",
	Inactive: "INACTIVE",
} as const satisfies Record<
	MasterPlanAndPackageStatus,
	MasterPlanAndPackageApiStatus
>;

export function mapMasterPlanAndPackagesResponse(
	response: MasterPlanAndPackagesResponse,
) {
	return {
		plans: response.plans.map(mapMasterPlanAndPackageRecord),
	};
}

export function mapMasterPlanAndPackageRecord(
	plan: MasterPlanAndPackageApiRecord,
): MasterPlanAndPackageRecord {
	const monthlyPrice = findPrice(plan.prices, "MONTHLY");
	const yearlyPrice = findPrice(plan.prices, "YEARLY");

	return {
		code: plan.code,
		description: plan.description,
		featureIds: plan.systemCodes.length > 0 ? plan.systemCodes : plan.moduleKeys,
		id: String(plan.id),
		name: plan.name,
		pricing: {
			monthlyBasePrice: centsToAmount(
				monthlyPrice?.compareAtInCents ?? monthlyPrice?.priceInCents ?? 0,
			),
			monthlyPercentOff: calculatePercentOff(monthlyPrice),
			yearlyBasePrice: centsToAmount(
				yearlyPrice?.compareAtInCents ?? yearlyPrice?.priceInCents ?? 0,
			),
			yearlyPercentOff: calculatePercentOff(yearlyPrice),
		},
		scalePricing: {
			branch: mapScaleRule(plan, "BRANCH"),
			user: mapScaleRule(plan, "USER"),
		},
		scope: plan.scope,
		status: StatusByApiStatus[plan.status],
		trialDays: plan.trialDays,
	};
}

export function mapCreateMasterPlanAndPackageRequest(
	values: MasterPlanAndPackageFormValues,
): CreateMasterPlanAndPackageRequest {
	return {
		code: values.code.trim().toUpperCase().replace(/\s+/g, "_"),
		description: values.description.trim() || null,
		discountTiers: [
			...values.branchReductionTiers.map((tier) => ({
				discountPercent: tier.reductionPercent,
				metric: "BRANCH" as const,
				thresholdCount: tier.thresholdCount,
			})),
			...values.userReductionTiers.map((tier) => ({
				discountPercent: tier.reductionPercent,
				metric: "USER" as const,
				thresholdCount: tier.thresholdCount,
			})),
		],
		systemCodes: values.featureIds,
		name: values.name.trim(),
		prices: [
			createPrice({
				billingCycle: "MONTHLY",
				basePrice: values.monthlyBasePrice,
				intervalUnit: "MONTH",
				percentOff: values.monthlyPercentOff,
			}),
			createPrice({
				billingCycle: "YEARLY",
				basePrice: values.yearlyBasePrice,
				intervalUnit: "YEAR",
				percentOff: values.yearlyPercentOff,
			}),
		],
		scope: values.scope,
		status: ApiStatusByStatus[values.status],
		trialDays: values.trialDays,
		usageRules: [
			{
				freeCount: values.branchIncludedFree,
				metric: "BRANCH",
				unitPriceInCents: amountToCents(values.branchAddOnPrice),
			},
			{
				freeCount: values.userIncludedFree,
				metric: "USER",
				unitPriceInCents: amountToCents(values.userAddOnPrice),
			},
		],
	};
}

function mapScaleRule(
	plan: MasterPlanAndPackageApiRecord,
	metric: "BRANCH" | "USER",
): MasterPlanAndPackageScaleRule {
	const usageRule = plan.usageRules.find((rule) => rule.metric === metric);
	const reductionTiers = plan.discountTiers
		.filter((tier) => tier.metric === metric)
		.map((tier) => ({
			reductionPercent: tier.discountPercent,
			thresholdCount: tier.thresholdCount,
		}));

	return {
		addOnPrice: centsToAmount(usageRule?.unitPriceInCents ?? 0),
		includedFreeCount: usageRule?.freeCount ?? 0,
		reductionTiers,
	};
}

function createPrice({
	basePrice,
	billingCycle,
	intervalUnit,
	percentOff,
}: {
	basePrice: number;
	billingCycle: "MONTHLY" | "YEARLY";
	intervalUnit: "MONTH" | "YEAR";
	percentOff: number;
}): MasterPlanAndPackageApiPrice {
	const compareAtInCents = amountToCents(basePrice);
	const priceInCents = amountToCents(basePrice * (1 - percentOff / 100));

	return {
		billingCycle,
		compareAtInCents: percentOff > 0 ? compareAtInCents : null,
		intervalCount: 1,
		intervalUnit,
		priceInCents,
	};
}

function calculatePercentOff(price?: MasterPlanAndPackageApiPrice) {
	if (!price?.compareAtInCents || price.compareAtInCents <= 0) {
		return 0;
	}

	return Math.round(
		((price.compareAtInCents - price.priceInCents) /
			price.compareAtInCents) *
			100,
	);
}

function findPrice(
	prices: MasterPlanAndPackageApiPrice[],
	billingCycle: "MONTHLY" | "YEARLY",
) {
	return prices.find((price) => price.billingCycle === billingCycle);
}

function centsToAmount(value: number) {
	return value / 100;
}

function amountToCents(value: number) {
	return Math.round(value * 100);
}
