import {
	MasterPlanAndPackageFeatureOptions,
	MasterPlanAndPackageScalePeriodLabels,
	MasterPlanAndPackageScalePeriods,
	MasterPlanAndPackageScaleUnitLabels,
	MasterPlanAndPackageScaleUnits,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type {
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackagePricing,
	MasterPlanAndPackageReductionTier,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageScalePricing,
	MasterPlanAndPackageScaleRule,
	MasterPlanAndPackageScaleRules,
	MasterPlanAndPackageScaleUnit,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const FeatureLabelById = new Map(
	MasterPlanAndPackageFeatureOptions.map((feature) => [
		feature.id,
		feature.name,
	]),
);

export const MasterPlanAndPackageRecords: MasterPlanAndPackageRecord[] = [
	{
		code: "ACC-ESS",
		description:
			"Entry accounting package with dashboard, financial maintenance, cash receipts, disbursements, journals, and reporting modules.",
		featureIds: [
			"dashboard-overview",
			"maintenance-financial-management-charts-of-accounts",
			"cash-receipt-official-receipt",
			"cash-disbursement-disbursement-voucher",
			"general-journal-journal-voucher",
			"sales-service-invoice",
		],
		id: "plan-accounting-monthly",
		name: "Accounting Essentials",
		pricing: {
			monthlyBasePrice: 399,
			monthlyPercentOff: 0,
			yearlyBasePrice: 4788,
			yearlyPercentOff: 10,
		},
		scalePricing: createScalePricing({
			branch: createScaleRule({
				addOnPrice: 150,
				includedFreeCount: 1,
				reductionTiers: [{ reductionPercent: 5, thresholdCount: 6 }],
			}),
			user: createScaleRule({
				addOnPrice: 100,
				includedFreeCount: 1,
				reductionTiers: [
					{ reductionPercent: 5, thresholdCount: 10 },
					{ reductionPercent: 10, thresholdCount: 25 },
				],
			}),
		}),
		status: "Active",
		trialDays: 14,
	},
	{
		code: "INV-OPS",
		description:
			"Inventory and purchasing package for item maintenance, warehouse control, receiving, material requests, pick lists, and purchase workflows.",
		featureIds: [
			"dashboard-overview",
			"maintenance-items",
			"maintenance-warehouse-management",
			"inventory-receiving-report",
			"inventory-material-request",
			"inventory-pick-list",
			"purchasing-purchase-request",
			"purchasing-purchase-order",
		],
		id: "plan-inventory-quarter",
		name: "Inventory Operations",
		pricing: {
			monthlyBasePrice: 420,
			monthlyPercentOff: 0,
			yearlyBasePrice: 5040,
			yearlyPercentOff: 12,
		},
		scalePricing: createScalePricing({
			branch: createScaleRule({
				addOnPrice: 120,
				includedFreeCount: 8,
				reductionTiers: [
					{ reductionPercent: 5, thresholdCount: 12 },
					{ reductionPercent: 10, thresholdCount: 25 },
				],
			}),
			user: createScaleRule({
				addOnPrice: 80,
				includedFreeCount: 10,
				reductionTiers: [
					{ reductionPercent: 5, thresholdCount: 25 },
					{ reductionPercent: 10, thresholdCount: 50 },
				],
			}),
		}),
		status: "Active",
		trialDays: 14,
	},
	{
		code: "FULL-SUITE",
		description:
			"Full operating package with accounting, inventory, purchasing, reports, administration, and shared maintenance modules.",
		featureIds: [
			"dashboard-overview",
			"maintenance-party-management",
			"cash-receipt-official-receipt",
			"cash-disbursement-request-for-payment",
			"accounts-payable-accounts-payable-voucher",
			"general-journal-journal-voucher",
			"sales-sales-invoice",
			"inventory-receiving-report",
			"purchasing-purchase-order",
			"maintenance-users",
		],
		id: "plan-full-suite-annual",
		name: "Full Suite",
		pricing: {
			monthlyBasePrice: 590,
			monthlyPercentOff: 0,
			yearlyBasePrice: 7080,
			yearlyPercentOff: 15,
		},
		scalePricing: createScalePricing({
			branch: createScaleRule({
				addOnPrice: 250,
				includedFreeCount: 5,
				reductionTiers: [
					{ reductionPercent: 8, thresholdCount: 10 },
					{ reductionPercent: 12, thresholdCount: 20 },
				],
			}),
			user: createScaleRule({
				addOnPrice: 100,
				includedFreeCount: 5,
				reductionTiers: [
					{ reductionPercent: 5, thresholdCount: 25 },
					{ reductionPercent: 15, thresholdCount: 50 },
				],
			}),
		}),
		status: "Draft",
		trialDays: 30,
	},
	{
		code: "TRANS-LITE",
		description:
			"Light operating package for low-volume subscribers that need a simple base plan with predictable add-ons.",
		featureIds: [
			"dashboard-overview",
			"cash-receipt-provisional-receipt",
			"cash-disbursement-petty-cash-voucher",
			"sales-service-invoice",
			"reports-financial",
		],
		id: "plan-transaction-lite",
		name: "Transaction Lite",
		pricing: {
			monthlyBasePrice: 299,
			monthlyPercentOff: 0,
			yearlyBasePrice: 3588,
			yearlyPercentOff: 8,
		},
		scalePricing: createScalePricing({
			branch: createScaleRule({
				addOnPrice: 100,
				includedFreeCount: 1,
				reductionTiers: [{ reductionPercent: 5, thresholdCount: 5 }],
			}),
			user: createScaleRule({
				addOnPrice: 80,
				includedFreeCount: 1,
				reductionTiers: [
					{ reductionPercent: 5, thresholdCount: 10 },
					{ reductionPercent: 10, thresholdCount: 20 },
				],
			}),
		}),
		status: "Inactive",
		trialDays: 7,
	},
	{
		code: "LAUNCH-UPGRADE",
		description:
			"Promotional upgrade package that discounts base subscription pricing while retaining standard module access and scale rules.",
		featureIds: [
			"dashboard-overview",
			"maintenance-financial-management-discount-management",
			"sales-sales-quotation",
			"sales-sales-invoice",
			"inventory-inventory-account",
			"reports-inventory",
			"maintenance-approval",
		],
		id: "plan-launch-upgrade",
		name: "Launch Upgrade",
		pricing: {
			monthlyBasePrice: 499,
			monthlyPercentOff: 20,
			yearlyBasePrice: 5988,
			yearlyPercentOff: 25,
		},
		scalePricing: createScalePricing({
			branch: createScaleRule({
				addOnPrice: 180,
				includedFreeCount: 6,
				reductionTiers: [
					{ reductionPercent: 5, thresholdCount: 12 },
					{ reductionPercent: 10, thresholdCount: 25 },
				],
			}),
			user: createScaleRule({
				addOnPrice: 100,
				includedFreeCount: 9,
				reductionTiers: [
					{ reductionPercent: 5, thresholdCount: 10 },
					{ reductionPercent: 10, thresholdCount: 25 },
					{ reductionPercent: 20, thresholdCount: 50 },
					{ reductionPercent: 25, thresholdCount: 100 },
				],
			}),
		}),
		status: "Active",
		trialDays: 30,
	},
];

export const InitialMasterPlanAndPackageFormValues: MasterPlanAndPackageFormValues =
	{
		code: "",
		description: "",
		featureIds: MasterPlanAndPackageFeatureOptions.map((feature) => feature.id),
		monthlyBasePrice: 0,
		monthlyBranchAddOnPrice: 0,
		monthlyBranchIncludedFree: 1,
		monthlyBranchReductionTiers: createEmptyReductionTiers(),
		monthlyPercentOff: 0,
		monthlyUserAddOnPrice: 0,
		monthlyUserIncludedFree: 1,
		monthlyUserReductionTiers: createEmptyReductionTiers(),
		name: "",
		status: "Active",
		trialDays: 0,
		yearlyBasePrice: 0,
		yearlyBranchAddOnPrice: 0,
		yearlyBranchIncludedFree: 1,
		yearlyBranchReductionTiers: createEmptyReductionTiers(),
		yearlyPercentOff: 0,
		yearlyUserAddOnPrice: 0,
		yearlyUserIncludedFree: 1,
		yearlyUserReductionTiers: createEmptyReductionTiers(),
	};

export function getMasterPlanAndPackageById(recordId: string) {
	return MasterPlanAndPackageRecords.find((record) => record.id === recordId);
}

export function createMasterPlanAndPackageFormValues(
	record: MasterPlanAndPackageRecord,
): MasterPlanAndPackageFormValues {
	const scaleValues = createScalePricingFormValues(record.scalePricing);

	return {
		...InitialMasterPlanAndPackageFormValues,
		code: record.code,
		...record.pricing,
		...scaleValues,
		description: record.description,
		featureIds: [...record.featureIds],
		id: record.id,
		name: record.name,
		status: record.status,
	};
}

export function createMasterPlanAndPackageRecord(
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackageRecord {
	const trimmedName = values.name.trim();

	return {
		code: values.code.trim().toUpperCase(),
		description: values.description.trim(),
		featureIds: [...values.featureIds],
		id: values.id ?? `plan-${slugify(values.code.trim() || trimmedName)}`,
		name: trimmedName,
		pricing: createPricingFromFormValues(values),
		scalePricing: createScalePricingFromFormValues(values),
		status: values.status,
		trialDays: values.trialDays,
	};
}

export function formatMasterPlanAndPackageCurrency(value: number) {
	return `PHP ${value.toLocaleString("en-PH", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	})}`;
}

export function calculateMasterPlanAndPackageDiscountedPrice({
	basePrice,
	percentOff,
}: {
	basePrice: number;
	percentOff: number;
}) {
	return basePrice * (1 - percentOff / 100);
}

export function formatMasterPlanAndPackagePricing(
	pricing: MasterPlanAndPackagePricing,
) {
	return [
		formatPriceWithDiscount({
			basePrice: pricing.monthlyBasePrice,
			intervalLabel: "month",
			percentOff: pricing.monthlyPercentOff,
		}),
		formatPriceWithDiscount({
			basePrice: pricing.yearlyBasePrice,
			intervalLabel: "year",
			percentOff: pricing.yearlyPercentOff,
		}),
	].join(" | ");
}

export function formatMasterPlanAndPackageScalePricing(
	scalePricing: MasterPlanAndPackageScalePricing,
) {
	return MasterPlanAndPackageScalePeriods.map((period) => {
		const periodLabel = MasterPlanAndPackageScalePeriodLabels[period];
		const rules = scalePricing[period];
		const intervalLabel = period === "monthly" ? "month" : "year";
		const ruleLabel = MasterPlanAndPackageScaleUnits.map((unit) => {
			const unitLabel = MasterPlanAndPackageScaleUnitLabels[unit];

			return `${unitLabel}: ${formatScaleRule({
				intervalLabel,
				rule: rules[unit],
				unit,
			})}`;
		}).join("; ");

		return `${periodLabel}: ${ruleLabel}`;
	})
		.join(" | ");
}

export function getMasterPlanAndPackagePricingSupportingText(
	pricing: MasterPlanAndPackagePricing,
) {
	const discounts = [
		pricing.monthlyPercentOff,
		pricing.yearlyPercentOff,
	].filter((percentOff) => percentOff > 0);

	if (discounts.length === 0) {
		return "Monthly and yearly base prices";
	}

	return `${Math.max(...discounts)}% max discount`;
}

export function getMasterPlanAndPackageScaleSupportingText(
	scalePricing: MasterPlanAndPackageScalePricing,
) {
	const tierCount = MasterPlanAndPackageScalePeriods.reduce(
		(total, period) =>
			total +
			Object.values(scalePricing[period]).reduce(
				(periodTotal, rule) => periodTotal + rule.reductionTiers.length,
				0,
			),
		0,
	);

	return `${tierCount} reduction tiers across monthly and yearly add-ons`;
}

export function getMasterPlanAndPackageFeatureLabel(featureId: string) {
	return FeatureLabelById.get(featureId) ?? titleFromToken(featureId);
}

export function getMasterPlanAndPackageFeatureLabels(featureIds: string[]) {
	return featureIds.map(getMasterPlanAndPackageFeatureLabel);
}

function createScalePricing(
	monthlyScalePricing: MasterPlanAndPackageScaleRules,
): MasterPlanAndPackageScalePricing {
	return {
		monthly: monthlyScalePricing,
		yearly: {
			branch: createYearlyScaleRule(monthlyScalePricing.branch),
			user: createYearlyScaleRule(monthlyScalePricing.user),
		},
	};
}

function createScaleRule(
	rule: MasterPlanAndPackageScaleRule,
): MasterPlanAndPackageScaleRule {
	return rule;
}

function createScalePricingFormValues(
	scalePricing: MasterPlanAndPackageScalePricing,
): Partial<MasterPlanAndPackageFormValues> {
	return {
		...createScaleRuleFormValues("monthlyBranch", scalePricing.monthly.branch),
		...createScaleRuleFormValues("monthlyUser", scalePricing.monthly.user),
		...createScaleRuleFormValues("yearlyBranch", scalePricing.yearly.branch),
		...createScaleRuleFormValues("yearlyUser", scalePricing.yearly.user),
	};
}

function createScaleRuleFormValues(
	prefix: "monthlyBranch" | "monthlyUser" | "yearlyBranch" | "yearlyUser",
	rule: MasterPlanAndPackageScaleRule,
): Partial<MasterPlanAndPackageFormValues> {
	return {
		[`${prefix}AddOnPrice`]: rule.addOnPrice,
		[`${prefix}IncludedFree`]: rule.includedFreeCount,
		[`${prefix}ReductionTiers`]: rule.reductionTiers.map((tier) => ({
			...tier,
		})),
	} as Partial<MasterPlanAndPackageFormValues>;
}

function createPricingFromFormValues(
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackagePricing {
	return {
		monthlyBasePrice: values.monthlyBasePrice,
		monthlyPercentOff: values.monthlyPercentOff,
		yearlyBasePrice: values.yearlyBasePrice,
		yearlyPercentOff: values.yearlyPercentOff,
	};
}

function createScalePricingFromFormValues(
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackageScalePricing {
	return {
		monthly: {
			branch: {
				addOnPrice: values.monthlyBranchAddOnPrice,
				includedFreeCount: values.monthlyBranchIncludedFree,
				reductionTiers: values.monthlyBranchReductionTiers.map((tier) => ({
					...tier,
				})),
			},
			user: {
				addOnPrice: values.monthlyUserAddOnPrice,
				includedFreeCount: values.monthlyUserIncludedFree,
				reductionTiers: values.monthlyUserReductionTiers.map((tier) => ({
					...tier,
				})),
			},
		},
		yearly: {
			branch: {
				addOnPrice: values.yearlyBranchAddOnPrice,
				includedFreeCount: values.yearlyBranchIncludedFree,
				reductionTiers: values.yearlyBranchReductionTiers.map((tier) => ({
					...tier,
				})),
			},
			user: {
				addOnPrice: values.yearlyUserAddOnPrice,
				includedFreeCount: values.yearlyUserIncludedFree,
				reductionTiers: values.yearlyUserReductionTiers.map((tier) => ({
					...tier,
				})),
			},
		},
	};
}

function createYearlyScaleRule(
	rule: MasterPlanAndPackageScaleRule,
): MasterPlanAndPackageScaleRule {
	return {
		addOnPrice: rule.addOnPrice * 10,
		includedFreeCount: rule.includedFreeCount,
		reductionTiers: rule.reductionTiers.map((tier) => ({
			reductionPercent: Math.min(tier.reductionPercent + 5, 100),
			thresholdCount: tier.thresholdCount,
		})),
	};
}

function formatPriceWithDiscount({
	basePrice,
	intervalLabel,
	percentOff,
}: {
	basePrice: number;
	intervalLabel: "month" | "year";
	percentOff: number;
}) {
	const discountedPrice = calculateMasterPlanAndPackageDiscountedPrice({
		basePrice,
		percentOff,
	});
	const priceLabel = `${formatMasterPlanAndPackageCurrency(
		discountedPrice,
	)} / ${intervalLabel}`;

	if (percentOff <= 0) {
		return priceLabel;
	}

	return `${priceLabel} (${percentOff}% off ${formatMasterPlanAndPackageCurrency(
		basePrice,
	)})`;
}

function formatScaleRule({
	intervalLabel,
	rule,
	unit,
}: {
	intervalLabel: "month" | "year";
	rule: MasterPlanAndPackageScaleRule;
	unit: MasterPlanAndPackageScaleUnit;
}) {
	const label = MasterPlanAndPackageScaleUnitLabels[unit].toLowerCase();
	const reductionLabel =
		rule.reductionTiers.length > 0
			? rule.reductionTiers
					.map(
						(tier) =>
							`${tier.thresholdCount}+ ${getScaleUnitPluralLabel(
								unit,
							)}: ${tier.reductionPercent}% off`,
					)
					.join(", ")
			: "no reduction tiers";

	return `${rule.includedFreeCount} included ${getScaleUnitCountLabel(
		unit,
		rule.includedFreeCount,
	)}; ${formatMasterPlanAndPackageCurrency(
		rule.addOnPrice,
	)} per additional ${label} / ${intervalLabel}; ${reductionLabel}`;
}

function createEmptyReductionTiers(): MasterPlanAndPackageReductionTier[] {
	return [];
}

function getScaleUnitPluralLabel(unit: MasterPlanAndPackageScaleUnit) {
	switch (unit) {
		case "branch":
			return "branches";
		case "user":
			return "users";
	}
}

function getScaleUnitCountLabel(
	unit: MasterPlanAndPackageScaleUnit,
	count: number,
) {
	if (count === 1) {
		return MasterPlanAndPackageScaleUnitLabels[unit].toLowerCase();
	}

	return getScaleUnitPluralLabel(unit);
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function titleFromToken(value: string) {
	return value
		.split("-")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
