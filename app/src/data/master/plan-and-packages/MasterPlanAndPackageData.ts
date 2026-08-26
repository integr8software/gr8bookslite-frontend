import {
	MasterPlanAndPackageScaleUnitLabels,
	MasterPlanAndPackageScaleUnits,
	MasterPlanAndPackageScopeLabels,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type {
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackagePricing,
	MasterPlanAndPackageReductionTier,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageScalePricing,
	MasterPlanAndPackageScaleRule,
	MasterPlanAndPackageScaleUnit,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const FeatureLabelById = new Map([
	["ACCOUNTING", "Accounting"],
	["INVENTORY", "Inventory"],
]);

export const MasterPlanAndPackageRecords: MasterPlanAndPackageRecord[] = [
	{
		code: "ACC-ESS",
		description:
			"Entry accounting package with dashboard, maintenance setup, cash receipts, disbursements, journals, and reporting modules.",
		featureIds: [
			"ACCOUNTING",
		],
		id: "plan-accounting-monthly",
		name: "Accounting Essentials",
		pricing: {
			monthlyBasePrice: 399,
			monthlyPercentOff: 0,
			yearlyBasePrice: 4788,
			yearlyPercentOff: 10,
		},
		scalePricing: {
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
		},
		scope: "ONBOARDING",
		status: "Active",
		trialDays: 14,
	},
	{
		code: "INV-OPS",
		description:
			"Inventory and purchasing package for item maintenance, warehouse control, receiving, material requests, pick lists, and purchase workflows.",
		featureIds: [
			"INVENTORY",
		],
		id: "plan-inventory-quarter",
		name: "Inventory Operations",
		pricing: {
			monthlyBasePrice: 420,
			monthlyPercentOff: 0,
			yearlyBasePrice: 5040,
			yearlyPercentOff: 12,
		},
		scalePricing: {
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
		},
		scope: "ONBOARDING",
		status: "Active",
		trialDays: 14,
	},
	{
		code: "FULL-SUITE",
		description:
			"Full operating package with accounting, inventory, purchasing, reports, administration, and shared maintenance modules.",
		featureIds: [
			"ACCOUNTING",
			"INVENTORY",
		],
		id: "plan-full-suite-annual",
		name: "Full Suite",
		pricing: {
			monthlyBasePrice: 590,
			monthlyPercentOff: 0,
			yearlyBasePrice: 7080,
			yearlyPercentOff: 15,
		},
		scalePricing: {
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
		},
		scope: "ONBOARDING",
		status: "Draft",
		trialDays: 30,
	},
	{
		code: "TRANS-LITE",
		description:
			"Light operating package for low-volume subscribers that need a simple base plan with predictable add-ons.",
		featureIds: [
			"ACCOUNTING",
		],
		id: "plan-transaction-lite",
		name: "Transaction Lite",
		pricing: {
			monthlyBasePrice: 299,
			monthlyPercentOff: 0,
			yearlyBasePrice: 3588,
			yearlyPercentOff: 8,
		},
		scalePricing: {
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
		},
		scope: "ADDITIONAL_COMPANY",
		status: "Inactive",
		trialDays: 7,
	},
	{
		code: "LAUNCH-UPGRADE",
		description:
			"Promotional upgrade package that discounts base subscription pricing while retaining standard module access and scale rules.",
		featureIds: [
			"ACCOUNTING",
			"INVENTORY",
		],
		id: "plan-launch-upgrade",
		name: "Launch Upgrade",
		pricing: {
			monthlyBasePrice: 499,
			monthlyPercentOff: 20,
			yearlyBasePrice: 5988,
			yearlyPercentOff: 25,
		},
		scalePricing: {
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
		},
		scope: "ADDITIONAL_COMPANY",
		status: "Active",
		trialDays: 30,
	},
];

export const InitialMasterPlanAndPackageFormValues: MasterPlanAndPackageFormValues =
	{
		code: "",
		description: "",
		featureIds: [],
		branchAddOnPrice: 0,
		branchIncludedFree: 1,
		branchReductionTiers: createEmptyReductionTiers(),
		monthlyBasePrice: 0,
		monthlyPercentOff: 0,
		name: "",
		scope: "ALL",
		scopes: ["ALL"],
		status: "Active",
		trialDays: 0,
		userAddOnPrice: 0,
		userIncludedFree: 1,
		userReductionTiers: createEmptyReductionTiers(),
		yearlyBasePrice: 0,
		yearlyPercentOff: 0,
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
		scope: record.scope,
		scopes: record.scope === "ALL" ? ["ALL"] : [record.scope],
		status: record.status,
	};
}

export function createMasterPlanAndPackageRecord(
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackageRecord {
	const trimmedName = values.name.trim();
	const code =
		values.code?.trim().toUpperCase() ||
		slugify(trimmedName).toUpperCase().replace(/-/g, "_");

	return {
		code,
		description: values.description.trim(),
		featureIds: [...values.featureIds],
		id: values.id ?? `plan-${slugify(code || trimmedName)}`,
		name: trimmedName,
		pricing: createPricingFromFormValues(values),
		scalePricing: createScalePricingFromFormValues(values),
		scope: values.scope,
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
	const scaleLabels = MasterPlanAndPackageScaleUnits.map((unit) => {
		const unitLabel = MasterPlanAndPackageScaleUnitLabels[unit];
		const ruleLabel = formatScaleRule({
			rule: scalePricing[unit],
			unit,
		});

		return ruleLabel ? `${unitLabel}: ${ruleLabel}` : null;
	})
		.filter((label): label is string => Boolean(label));

	if (scaleLabels.length === 0) {
		return "No scale add-ons";
	}

	return scaleLabels.join("; ");
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

	return `${Math.max(...discounts)}% Discount`;
}

export function getMasterPlanAndPackageScaleSupportingText(
	scalePricing: MasterPlanAndPackageScalePricing,
) {
	const scaleUnits = MasterPlanAndPackageScaleUnits.filter((unit) =>
		shouldShowScaleRule(scalePricing[unit]),
	).map((unit) => MasterPlanAndPackageScaleUnitLabels[unit]);

	if (scaleUnits.length === 0) {
		return "No scale add-ons";
	}

	return `${scaleUnits.join(" and ")} pricing`;
}

export function formatMasterPlanAndPackageScope(
	scope: MasterPlanAndPackageRecord["scope"],
) {
	return MasterPlanAndPackageScopeLabels[scope];
}

export function getMasterPlanAndPackageFeatureLabel(featureId: string) {
	return FeatureLabelById.get(featureId) ?? titleFromToken(featureId);
}

export function getMasterPlanAndPackageFeatureLabels(featureIds: string[]) {
	return featureIds.map(getMasterPlanAndPackageFeatureLabel);
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
		...createScaleRuleFormValues("branch", scalePricing.branch),
		...createScaleRuleFormValues("user", scalePricing.user),
	};
}

function createScaleRuleFormValues(
	prefix: "branch" | "user",
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
		branch: {
			addOnPrice: values.branchAddOnPrice ?? 0,
			includedFreeCount: values.branchIncludedFree ?? 0,
			reductionTiers: (values.branchReductionTiers ?? []).map((tier) => ({
				...tier,
			})),
		},
		user: {
			addOnPrice: values.userAddOnPrice ?? 0,
			includedFreeCount: values.userIncludedFree ?? 0,
			reductionTiers: (values.userReductionTiers ?? []).map((tier) => ({
				...tier,
			})),
		},
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

	return priceLabel;
}

function formatScaleRule({
	rule,
	unit,
}: {
	rule: MasterPlanAndPackageScaleRule;
	unit: MasterPlanAndPackageScaleUnit;
}) {
	if (!shouldShowScaleRule(rule)) {
		return null;
	}

	const label = MasterPlanAndPackageScaleUnitLabels[unit].toLowerCase();
	const ruleParts: string[] = [];

	if (rule.includedFreeCount > 0) {
		ruleParts.push(
			`${rule.includedFreeCount} included ${getScaleUnitCountLabel(
				unit,
				rule.includedFreeCount,
			)}`,
		);
	}

	if (rule.addOnPrice > 0) {
		ruleParts.push(
			`${formatMasterPlanAndPackageCurrency(rule.addOnPrice)} per ${
				rule.includedFreeCount > 0 ? `additional ${label}` : label
			}`,
		);
	}

	if (rule.addOnPrice > 0 && rule.reductionTiers.length > 0) {
		ruleParts.push(
			rule.reductionTiers
				.map(
					(tier) =>
						`${tier.thresholdCount}+ ${getScaleUnitPluralLabel(
							unit,
						)}: ${tier.reductionPercent}% off`,
				)
				.join(", "),
		);
	}

	return ruleParts.join("; ");
}

function shouldShowScaleRule(rule: MasterPlanAndPackageScaleRule) {
	return rule.includedFreeCount > 0 || rule.addOnPrice > 0;
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
