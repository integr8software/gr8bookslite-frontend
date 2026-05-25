import {
	MasterPlanAndPackageFeatureOptions,
	MasterPlanAndPackageScaleUnitLabels,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type {
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackagePricing,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageScalePricing,
	MasterPlanAndPackageScaleRule,
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
		name: "Accounting Monthly",
		pricing: {
			amount: 399,
			kind: "Monthly",
		},
		scalePricing: createScalePricing({
			branch: {
				addOnPrice: 150,
				addOnStart: 2,
				includedFreeCount: 1,
				kind: "Add-on",
			},
			company: {
				addOnPrice: 0,
				addOnStart: 2,
				includedFreeCount: 1,
				kind: "Add-on",
			},
			user: {
				addOnPrice: 100,
				addOnStart: 2,
				includedFreeCount: 1,
				kind: "Add-on",
			},
		}),
		status: "Active",
	},
	{
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
		name: "Inventory Quarterly",
		pricing: {
			amount: 1050,
			intervalMonths: 3,
			kind: "Interval",
		},
		scalePricing: createScalePricing({
			branch: {
				kind: "Range",
				maxCount: 8,
				minCount: 1,
			},
			company: {
				includedCount: 1,
				kind: "Fixed",
			},
			user: {
				kind: "Range",
				maxCount: 10,
				minCount: 3,
			},
		}),
		status: "Active",
	},
	{
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
		name: "Full Suite Annual",
		pricing: {
			amount: 4990,
			kind: "Yearly",
		},
		scalePricing: createScalePricing({
			branch: {
				addOnPrice: 250,
				addOnStart: 6,
				includedFreeCount: 5,
				kind: "Add-on",
			},
			company: {
				addOnPrice: 650,
				addOnStart: 2,
				includedFreeCount: 1,
				kind: "Add-on",
			},
			user: {
				addOnPrice: 100,
				addOnStart: 6,
				includedFreeCount: 5,
				kind: "Add-on",
			},
		}),
		status: "Draft",
	},
	{
		description:
			"Usage-priced package for low-volume subscribers billed from actual posted transactions instead of a transactional unit label.",
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
			amount: 8,
			kind: "Transactional",
		},
		scalePricing: createScalePricing({
			branch: {
				includedCount: 1,
				kind: "Fixed",
			},
			company: {
				includedCount: 1,
				kind: "Fixed",
			},
			user: {
				addOnPrice: 80,
				addOnStart: 2,
				includedFreeCount: 1,
				kind: "Add-on",
			},
		}),
		status: "Inactive",
	},
	{
		description:
			"Promotional upgrade package that discounts an opening transaction range before standard renewal pricing applies.",
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
			appliesFrom: 1,
			appliesTo: 12,
			baseAmount: 4990,
			kind: "Percent Off",
			percentOff: 20,
		},
		scalePricing: createScalePricing({
			branch: {
				kind: "Range",
				maxCount: 6,
				minCount: 1,
			},
			company: {
				addOnPrice: 700,
				addOnStart: 2,
				includedFreeCount: 1,
				kind: "Add-on",
			},
			user: {
				addOnPrice: 100,
				addOnStart: 4,
				includedFreeCount: 3,
				kind: "Add-on",
			},
		}),
		status: "Active",
	},
];

export const InitialMasterPlanAndPackageFormValues: MasterPlanAndPackageFormValues =
	{
		amount: 0,
		baseAmount: 0,
		branchAddOnPrice: 0,
		branchAddOnStart: 2,
		branchIncludedFree: 1,
		branchLimitKind: "Add-on",
		branchMax: 5,
		branchMin: 1,
		companyAddOnPrice: 0,
		companyAddOnStart: 2,
		companyIncludedFree: 1,
		companyLimitKind: "Add-on",
		companyMax: 1,
		companyMin: 1,
		description: "",
		discountAppliesFrom: 1,
		discountAppliesTo: 12,
		featureIds: [],
		intervalMonths: 3,
		name: "",
		percentOff: 0,
		pricingKind: "Monthly",
		status: "Active",
		userAddOnPrice: 0,
		userAddOnStart: 2,
		userIncludedFree: 1,
		userLimitKind: "Add-on",
		userMax: 5,
		userMin: 1,
	};

export function getMasterPlanAndPackageById(recordId: string) {
	return MasterPlanAndPackageRecords.find((record) => record.id === recordId);
}

export function createMasterPlanAndPackageFormValues(
	record: MasterPlanAndPackageRecord,
): MasterPlanAndPackageFormValues {
	const pricingValues = createPricingFormValues(record.pricing);
	const scaleValues = createScalePricingFormValues(record.scalePricing);

	return {
		...InitialMasterPlanAndPackageFormValues,
		...pricingValues,
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
		description: values.description.trim(),
		featureIds: [...values.featureIds],
		id: values.id ?? `plan-${slugify(trimmedName)}`,
		name: trimmedName,
		pricing: createPricingFromFormValues(values),
		scalePricing: createScalePricingFromFormValues(values),
		status: values.status,
	};
}

export function formatMasterPlanAndPackageCurrency(value: number) {
	return `PHP ${value.toLocaleString("en-PH", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	})}`;
}

export function formatMasterPlanAndPackagePricing(
	pricing: MasterPlanAndPackagePricing,
) {
	switch (pricing.kind) {
		case "Monthly":
			return `${formatMasterPlanAndPackageCurrency(pricing.amount)} / month`;
		case "Interval":
			return `${formatMasterPlanAndPackageCurrency(pricing.amount)} every ${
				pricing.intervalMonths
			} months`;
		case "Yearly":
			return `${formatMasterPlanAndPackageCurrency(pricing.amount)} / year`;
		case "Transactional":
			return `${formatMasterPlanAndPackageCurrency(
				pricing.amount,
			)} per transaction`;
		case "Percent Off":
			return `${pricing.percentOff}% off ${formatMasterPlanAndPackageCurrency(
				pricing.baseAmount,
			)} for ${pricing.appliesFrom}-${pricing.appliesTo}`;
	}
}

export function formatMasterPlanAndPackageScalePricing(
	scalePricing: MasterPlanAndPackageScalePricing,
) {
	return (Object.keys(MasterPlanAndPackageScaleUnitLabels) as MasterPlanAndPackageScaleUnit[])
		.map((unit) => {
			const label = MasterPlanAndPackageScaleUnitLabels[unit];

			return `${label}: ${formatScaleRule(scalePricing[unit], unit)}`;
		})
		.join(" | ");
}

export function getMasterPlanAndPackagePricingSupportingText(
	pricing: MasterPlanAndPackagePricing,
) {
	switch (pricing.kind) {
		case "Monthly":
			return "Recurring monthly";
		case "Interval":
			return `Recurring ${pricing.intervalMonths}-month cycle`;
		case "Yearly":
			return "Recurring annual";
		case "Transactional":
			return "Usage based on system transactions";
		case "Percent Off":
			return "Discount applies to a numeric range";
	}
}

export function getMasterPlanAndPackageScaleSupportingText(
	scalePricing: MasterPlanAndPackageScalePricing,
) {
	const addOnUnits = (
		Object.keys(scalePricing) as MasterPlanAndPackageScaleUnit[]
	).filter((unit) => scalePricing[unit].kind === "Add-on");

	if (addOnUnits.length === 0) {
		return "Fixed or ranged allowances";
	}

	return `${addOnUnits
		.map((unit) => MasterPlanAndPackageScaleUnitLabels[unit].toLowerCase())
		.join(", ")} add-ons`;
}

export function getMasterPlanAndPackageFeatureLabel(featureId: string) {
	return FeatureLabelById.get(featureId) ?? titleFromToken(featureId);
}

export function getMasterPlanAndPackageFeatureLabels(featureIds: string[]) {
	return featureIds.map(getMasterPlanAndPackageFeatureLabel);
}

function createScalePricing(
	scalePricing: MasterPlanAndPackageScalePricing,
): MasterPlanAndPackageScalePricing {
	return scalePricing;
}

function createPricingFormValues(
	pricing: MasterPlanAndPackagePricing,
): Partial<MasterPlanAndPackageFormValues> {
	switch (pricing.kind) {
		case "Monthly":
		case "Yearly":
		case "Transactional":
			return {
				amount: pricing.amount,
				pricingKind: pricing.kind,
			};
		case "Interval":
			return {
				amount: pricing.amount,
				intervalMonths: pricing.intervalMonths,
				pricingKind: pricing.kind,
			};
		case "Percent Off":
			return {
				baseAmount: pricing.baseAmount,
				discountAppliesFrom: pricing.appliesFrom,
				discountAppliesTo: pricing.appliesTo,
				percentOff: pricing.percentOff,
				pricingKind: pricing.kind,
			};
	}
}

function createScalePricingFormValues(
	scalePricing: MasterPlanAndPackageScalePricing,
): Partial<MasterPlanAndPackageFormValues> {
	return {
		...createScaleRuleFormValues("company", scalePricing.company),
		...createScaleRuleFormValues("branch", scalePricing.branch),
		...createScaleRuleFormValues("user", scalePricing.user),
	};
}

function createScaleRuleFormValues(
	unit: MasterPlanAndPackageScaleUnit,
	rule: MasterPlanAndPackageScaleRule,
): Partial<MasterPlanAndPackageFormValues> {
	const prefix = unit;

	switch (rule.kind) {
		case "Fixed":
			return {
				[`${prefix}IncludedFree`]: rule.includedCount,
				[`${prefix}LimitKind`]: rule.kind,
			} as Partial<MasterPlanAndPackageFormValues>;
		case "Range":
			return {
				[`${prefix}LimitKind`]: rule.kind,
				[`${prefix}Max`]: rule.maxCount,
				[`${prefix}Min`]: rule.minCount,
			} as Partial<MasterPlanAndPackageFormValues>;
		case "Add-on":
			return {
				[`${prefix}AddOnPrice`]: rule.addOnPrice,
				[`${prefix}AddOnStart`]: rule.addOnStart,
				[`${prefix}IncludedFree`]: rule.includedFreeCount,
				[`${prefix}LimitKind`]: rule.kind,
			} as Partial<MasterPlanAndPackageFormValues>;
	}
}

function createPricingFromFormValues(
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackagePricing {
	switch (values.pricingKind) {
		case "Monthly":
			return { amount: values.amount, kind: values.pricingKind };
		case "Interval":
			return {
				amount: values.amount,
				intervalMonths: values.intervalMonths,
				kind: values.pricingKind,
			};
		case "Yearly":
			return { amount: values.amount, kind: values.pricingKind };
		case "Transactional":
			return {
				amount: values.amount,
				kind: values.pricingKind,
			};
		case "Percent Off":
			return {
				appliesFrom: values.discountAppliesFrom,
				appliesTo: values.discountAppliesTo,
				baseAmount: values.baseAmount,
				kind: values.pricingKind,
				percentOff: values.percentOff,
			};
	}
}

function createScalePricingFromFormValues(
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackageScalePricing {
	return {
		branch: createScaleRuleFromFormValues("branch", values),
		company: createScaleRuleFromFormValues("company", values),
		user: createScaleRuleFromFormValues("user", values),
	};
}

function createScaleRuleFromFormValues(
	unit: MasterPlanAndPackageScaleUnit,
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackageScaleRule {
	switch (unit) {
		case "branch":
			return createScaleRuleFromParts({
				addOnPrice: values.branchAddOnPrice,
				addOnStart: values.branchAddOnStart,
				includedFree: values.branchIncludedFree,
				limitKind: values.branchLimitKind,
				max: values.branchMax,
				min: values.branchMin,
			});
		case "company":
			return createScaleRuleFromParts({
				addOnPrice: values.companyAddOnPrice,
				addOnStart: values.companyAddOnStart,
				includedFree: values.companyIncludedFree,
				limitKind: values.companyLimitKind,
				max: values.companyMax,
				min: values.companyMin,
			});
		case "user":
			return createScaleRuleFromParts({
				addOnPrice: values.userAddOnPrice,
				addOnStart: values.userAddOnStart,
				includedFree: values.userIncludedFree,
				limitKind: values.userLimitKind,
				max: values.userMax,
				min: values.userMin,
			});
	}
}

function createScaleRuleFromParts({
	addOnPrice,
	addOnStart,
	includedFree,
	limitKind,
	max,
	min,
}: {
	addOnPrice: number;
	addOnStart: number;
	includedFree: number;
	limitKind: MasterPlanAndPackageScaleRule["kind"];
	max: number;
	min: number;
}): MasterPlanAndPackageScaleRule {
	switch (limitKind) {
		case "Fixed":
			return {
				includedCount: includedFree,
				kind: limitKind,
			};
		case "Range":
			return {
				kind: limitKind,
				maxCount: max,
				minCount: min,
			};
		case "Add-on":
			return {
				addOnPrice,
				addOnStart,
				includedFreeCount: includedFree,
				kind: limitKind,
			};
	}
}

function formatScaleRule(
	rule: MasterPlanAndPackageScaleRule,
	unit: MasterPlanAndPackageScaleUnit,
) {
	const label = MasterPlanAndPackageScaleUnitLabels[unit].toLowerCase();

	switch (rule.kind) {
		case "Fixed":
			return `fixed ${rule.includedCount}`;
		case "Range":
			return `${rule.minCount}-${rule.maxCount}`;
		case "Add-on":
			return `${rule.includedFreeCount} free, ${
				rule.addOnStart
			}+ at ${formatMasterPlanAndPackageCurrency(rule.addOnPrice)} / ${label}`;
	}
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
