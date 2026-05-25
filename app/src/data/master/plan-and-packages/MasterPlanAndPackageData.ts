import type {
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackagePricing,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageUserLimit,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

export const MasterPlanAndPackageRecords: MasterPlanAndPackageRecord[] = [
	{
		code: "ACCOUNTING-MONTHLY",
		description:
			"Entry accounting package with cash, payable, journal, sales, financial maintenance, and reporting modules.",
		features: [
			"Accounting module access",
			"One included user",
			"Monthly recurring billing",
		],
		id: "plan-accounting-monthly",
		name: "Accounting Monthly",
		pricing: {
			amount: 399,
			kind: "Monthly",
		},
		status: "Active",
		userLimit: {
			addOnPrice: 100,
			addOnStart: 2,
			includedFreeUsers: 1,
			kind: "Add-on",
		},
	},
	{
		code: "INVENTORY-QUARTER",
		description:
			"Inventory and purchasing package for stock movement, warehouse maintenance, receiving, and purchase workflows.",
		features: [
			"Inventory and purchasing",
			"Quarterly billing",
			"Team range enforcement",
		],
		id: "plan-inventory-quarter",
		name: "Inventory Quarterly",
		pricing: {
			amount: 1050,
			intervalMonths: 3,
			kind: "Interval",
		},
		status: "Active",
		userLimit: {
			kind: "Range",
			maxUsers: 10,
			minUsers: 3,
		},
	},
	{
		code: "FULL-SUITE-ANNUAL",
		description:
			"Full operating package with accounting, inventory, purchasing, reporting, and shared maintenance modules.",
		features: [
			"Accounting and inventory suite",
			"Annual billing",
			"Five fixed included seats",
		],
		id: "plan-full-suite-annual",
		name: "Full Suite Annual",
		pricing: {
			amount: 4990,
			kind: "Yearly",
		},
		status: "Draft",
		userLimit: {
			includedUsers: 5,
			kind: "Fixed",
		},
	},
	{
		code: "TRANSACTION-LITE",
		description:
			"Usage-priced package for low-volume companies that need billing by posted transaction instead of a recurring subscription.",
		features: [
			"Transactional billing",
			"Core posting tools",
			"One free operator seat",
		],
		id: "plan-transaction-lite",
		name: "Transaction Lite",
		pricing: {
			amount: 8,
			kind: "Transactional",
			unitLabel: "posted transaction",
		},
		status: "Inactive",
		userLimit: {
			addOnPrice: 80,
			addOnStart: 2,
			includedFreeUsers: 1,
			kind: "Add-on",
		},
	},
	{
		code: "LAUNCH-UPGRADE",
		description:
			"Promotional upgrade plan that discounts the first annual package term before standard renewal pricing applies.",
		features: [
			"First-year promotional pricing",
			"Accounting and inventory access",
			"Three included users before add-ons",
		],
		id: "plan-launch-upgrade",
		name: "Launch Upgrade",
		pricing: {
			baseAmount: 4990,
			billingLabel: "first year",
			kind: "Percent Off",
			percentOff: 20,
		},
		status: "Active",
		userLimit: {
			addOnPrice: 100,
			addOnStart: 4,
			includedFreeUsers: 3,
			kind: "Add-on",
		},
	},
];

export const InitialMasterPlanAndPackageFormValues: MasterPlanAndPackageFormValues =
	{
		amount: 0,
		baseAmount: 0,
		billingLabel: "first year",
		code: "",
		description: "",
		features: "",
		intervalMonths: 3,
		name: "",
		percentOff: 0,
		pricingKind: "Monthly",
		status: "Active",
		unitLabel: "transaction",
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
	const userValues = createUserLimitFormValues(record.userLimit);

	return {
		...InitialMasterPlanAndPackageFormValues,
		...pricingValues,
		...userValues,
		code: record.code,
		description: record.description,
		features: record.features.join("\n"),
		id: record.id,
		name: record.name,
		status: record.status,
	};
}

export function createMasterPlanAndPackageRecord(
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackageRecord {
	const trimmedCode = values.code.trim().toUpperCase();

	return {
		code: trimmedCode,
		description: values.description.trim(),
		features: splitFeatureLines(values.features),
		id:
			values.id ??
			`plan-${trimmedCode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
		name: values.name.trim(),
		pricing: createPricingFromFormValues(values),
		status: values.status,
		userLimit: createUserLimitFromFormValues(values),
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
			return `${formatMasterPlanAndPackageCurrency(pricing.amount)} / ${
				pricing.unitLabel
			}`;
		case "Percent Off":
			return `${pricing.percentOff}% off ${formatMasterPlanAndPackageCurrency(
				pricing.baseAmount,
			)} ${pricing.billingLabel}`;
	}
}

export function formatMasterPlanAndPackageUserLimit(
	userLimit: MasterPlanAndPackageUserLimit,
) {
	switch (userLimit.kind) {
		case "Fixed":
			return `Fixed ${userLimit.includedUsers} ${
				userLimit.includedUsers === 1 ? "user" : "users"
			}`;
		case "Range":
			return `${userLimit.minUsers}-${userLimit.maxUsers} users`;
		case "Add-on":
			return `${userLimit.includedFreeUsers} free, ${
				userLimit.addOnStart
			}+ add-on`;
	}
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
			return "Usage based";
		case "Percent Off":
			return "Discounted pricing";
	}
}

export function getMasterPlanAndPackageUserSupportingText(
	userLimit: MasterPlanAndPackageUserLimit,
) {
	if (userLimit.kind !== "Add-on") {
		return userLimit.kind;
	}

	return `${formatMasterPlanAndPackageCurrency(userLimit.addOnPrice)} per extra user`;
}

function createPricingFormValues(
	pricing: MasterPlanAndPackagePricing,
): Partial<MasterPlanAndPackageFormValues> {
	switch (pricing.kind) {
		case "Monthly":
		case "Yearly":
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
		case "Transactional":
			return {
				amount: pricing.amount,
				pricingKind: pricing.kind,
				unitLabel: pricing.unitLabel,
			};
		case "Percent Off":
			return {
				baseAmount: pricing.baseAmount,
				billingLabel: pricing.billingLabel,
				percentOff: pricing.percentOff,
				pricingKind: pricing.kind,
			};
	}
}

function createUserLimitFormValues(
	userLimit: MasterPlanAndPackageUserLimit,
): Partial<MasterPlanAndPackageFormValues> {
	switch (userLimit.kind) {
		case "Fixed":
			return {
				userIncludedFree: userLimit.includedUsers,
				userLimitKind: userLimit.kind,
			};
		case "Range":
			return {
				userLimitKind: userLimit.kind,
				userMax: userLimit.maxUsers,
				userMin: userLimit.minUsers,
			};
		case "Add-on":
			return {
				userAddOnPrice: userLimit.addOnPrice,
				userAddOnStart: userLimit.addOnStart,
				userIncludedFree: userLimit.includedFreeUsers,
				userLimitKind: userLimit.kind,
			};
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
				unitLabel: values.unitLabel.trim(),
			};
		case "Percent Off":
			return {
				baseAmount: values.baseAmount,
				billingLabel: values.billingLabel.trim(),
				kind: values.pricingKind,
				percentOff: values.percentOff,
			};
	}
}

function createUserLimitFromFormValues(
	values: MasterPlanAndPackageFormValues,
): MasterPlanAndPackageUserLimit {
	switch (values.userLimitKind) {
		case "Fixed":
			return {
				includedUsers: values.userIncludedFree,
				kind: values.userLimitKind,
			};
		case "Range":
			return {
				kind: values.userLimitKind,
				maxUsers: values.userMax,
				minUsers: values.userMin,
			};
		case "Add-on":
			return {
				addOnPrice: values.userAddOnPrice,
				addOnStart: values.userAddOnStart,
				includedFreeUsers: values.userIncludedFree,
				kind: values.userLimitKind,
			};
	}
}

function splitFeatureLines(value: string) {
	return value
		.split("\n")
		.map((feature) => feature.trim())
		.filter(Boolean);
}
