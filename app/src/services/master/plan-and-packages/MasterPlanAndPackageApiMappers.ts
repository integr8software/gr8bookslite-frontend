import { MasterPlanAndPackageScopes } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type {
	CreateMasterPlanAndPackagePayload,
	MasterPlanAndPackageApiMetric,
	MasterPlanAndPackageApiPrice,
	MasterPlanAndPackageApiRecord,
	MasterPlanAndPackageApiStatus,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageScaleRule,
	MasterPlanAndPackagesApiData,
	MasterPlanAndPackageStatus,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const ScaleMetricBranch: MasterPlanAndPackageApiMetric = "BRANCH";
const ScaleMetricUser: MasterPlanAndPackageApiMetric = "USER";

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
	response: MasterPlanAndPackagesApiData,
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
			branch: mapScaleRule(plan, ScaleMetricBranch),
			user: mapScaleRule(plan, ScaleMetricUser),
		},
		scope: plan.scope,
		status: StatusByApiStatus[plan.status],
		trialDays: plan.trialDays,
	};
}

export function mapCreateMasterPlanAndPackagePayload(
	values: MasterPlanAndPackageFormValues,
): CreateMasterPlanAndPackagePayload {
	const code = values.code?.trim()
		? values.code.trim().toUpperCase().replace(/\s+/g, "_")
		: null;

	const scope =
		values.scopes && values.scopes.length > 0
			? values.scopes.includes(MasterPlanAndPackageScopes.ALL) ||
			  (values.scopes.includes(MasterPlanAndPackageScopes.ONBOARDING) &&
					values.scopes.includes(MasterPlanAndPackageScopes.ADDITIONAL_COMPANY))
				? MasterPlanAndPackageScopes.ALL
				: values.scopes[0]
			: values.scope ?? MasterPlanAndPackageScopes.ALL;

	return {
		code,
		description: values.description.trim() || null,
		discountTiers: [
			...(values.branchReductionTiers ?? []).map((tier) => ({
				discountPercent: tier.reductionPercent,
				metric: ScaleMetricBranch,
				thresholdCount: tier.thresholdCount,
			})),
			...(values.userReductionTiers ?? []).map((tier) => ({
				discountPercent: tier.reductionPercent,
				metric: ScaleMetricUser,
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
		scope,
		status: ApiStatusByStatus[values.status],
		trialDays: values.trialDays,
		usageRules: [
			...(values.branchIncludedFree !== undefined || values.branchAddOnPrice !== undefined
				? [
						{
							freeCount: values.branchIncludedFree ?? 0,
							metric: ScaleMetricBranch,
							unitPriceInCents: amountToCents(values.branchAddOnPrice ?? 0),
						},
				  ]
				: []),
			...(values.userIncludedFree !== undefined || values.userAddOnPrice !== undefined
				? [
						{
							freeCount: values.userIncludedFree ?? 0,
							metric: ScaleMetricUser,
							unitPriceInCents: amountToCents(values.userAddOnPrice ?? 0),
						},
				  ]
				: []),
		],
	};
}

function mapScaleRule(
	plan: MasterPlanAndPackageApiRecord,
	metric: MasterPlanAndPackageApiMetric,
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
