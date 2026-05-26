import { MasterPlanAndPackageRecords } from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";
import type {
	MasterPlanAndPackagePricing,
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageScaleRule,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import type {
	MasterSubscriptionBillingCycle,
	MasterSubscriptionCompanyRecord,
	MasterSubscriptionModuleOption,
	MasterSubscriptionPlanFormValues,
	MasterSubscriptionPlanRecord,
	MasterSubscriptionPreviewValues,
	MasterSubscriptionQuote,
	MasterSubscriptionUnit,
	MasterSubscriptionUnitQuote,
	MasterSubscriptionVolumeRuleRecord,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";

export const MasterSubscriptionModules: MasterSubscriptionModuleOption[] = [
	{
		category: "Accounting",
		description: "Chart of accounts, journals, ledgers, and financial reports.",
		id: "accounting-core",
		name: "Accounting Core",
	},
	{
		category: "Accounting",
		description: "Invoices, official receipts, collections, and AR aging.",
		id: "sales-billing",
		name: "Sales & Billing",
	},
	{
		category: "Accounting",
		description: "Bills, vouchers, disbursements, and supplier balances.",
		id: "purchase-payables",
		name: "Purchasing & Payables",
	},
	{
		category: "Inventory",
		description: "Items, warehouses, stock cards, and inventory movement.",
		id: "inventory-control",
		name: "Inventory Control",
	},
	{
		category: "Operations",
		description: "Multi-company switching, branch access, and satellite setup.",
		id: "multi-entity",
		name: "Multi-entity Operations",
	},
	{
		category: "Administration",
		description: "User roles, approvals, audit logs, and system controls.",
		id: "admin-security",
		name: "Admin & Security",
	},
];

export const MasterSubscriptionPlans: MasterSubscriptionPlanRecord[] =
	MasterPlanAndPackageRecords.map(createMasterSubscriptionPlanFromPackage);

export const MasterSubscriptionVolumeRules: MasterSubscriptionVolumeRuleRecord[] =
	[
		{
			discountPercent: 8,
			endsAt: 10,
			id: "rule-full-suite-company-2",
			label: "Company add-on 2 to 10",
			planId: "plan-full-suite-annual",
			startsAt: 2,
			unit: "company",
		},
		{
			discountPercent: 15,
			endsAt: null,
			id: "rule-full-suite-company-11",
			label: "Company add-on 11+",
			planId: "plan-full-suite-annual",
			startsAt: 11,
			unit: "company",
		},
		{
			discountPercent: 10,
			endsAt: null,
			id: "rule-launch-company-2",
			label: "Launch company add-on 2+",
			planId: "plan-launch-upgrade",
			startsAt: 2,
			unit: "company",
		},
		{
			discountPercent: 5,
			endsAt: 24,
			id: "rule-launch-user-10",
			label: "Launch user reduction 10 to 24",
			planId: "plan-launch-upgrade",
			startsAt: 10,
			unit: "user",
		},
		{
			discountPercent: 10,
			endsAt: null,
			id: "rule-launch-user-25",
			label: "Launch user reduction 25+",
			planId: "plan-launch-upgrade",
			startsAt: 25,
			unit: "user",
		},
	];

export const MasterSubscriptionCompanies: MasterSubscriptionCompanyRecord[] = [
	{
		billingCycle: "Monthly",
		branchCount: 3,
		companyCount: 4,
		durationMonths: 18,
		id: "sub-gr8books",
		name: "Gr8Books HQ",
		ownerName: "John Dela Cruz",
		planId: "plan-launch-upgrade",
		renewalDate: "2026-06-01",
		status: "Active",
		userCount: 15,
	},
	{
		billingCycle: "Monthly",
		branchCount: 1,
		companyCount: 1,
		durationMonths: 1,
		id: "sub-demo-trading",
		name: "Demo Trading Corp.",
		ownerName: "Jane Santos",
		planId: "plan-accounting-monthly",
		renewalDate: "2026-06-05",
		status: "Trial",
		userCount: 4,
	},
	{
		billingCycle: "Annual",
		branchCount: 14,
		companyCount: 12,
		durationMonths: 36,
		id: "sub-laguna-manufacturing",
		name: "Laguna Manufacturing Inc.",
		ownerName: "Emily Lim",
		planId: "plan-full-suite-annual",
		renewalDate: "2027-05-10",
		status: "Active",
		userCount: 42,
	},
	{
		billingCycle: "Every 3 months",
		branchCount: 18,
		companyCount: 24,
		durationMonths: 9,
		id: "sub-visayas-retail",
		name: "Visayas Retail Group",
		ownerName: "Miguel Reyes",
		planId: "plan-inventory-quarter",
		renewalDate: "2026-05-10",
		status: "Past Due",
		userCount: 65,
	},
	{
		billingCycle: "Per transaction",
		branchCount: 1,
		companyCount: 1,
		durationMonths: 2,
		id: "sub-cebu-service-studio",
		name: "Cebu Service Studio",
		ownerName: "Angela Uy",
		planId: "plan-transaction-lite",
		renewalDate: "2026-06-12",
		status: "Scheduled",
		userCount: 2,
	},
];

export const InitialMasterSubscriptionPreviewValues: MasterSubscriptionPreviewValues =
	{
		branches: 14,
		companies: 12,
		users: 42,
	};

export function createMasterSubscriptionPlanDraft(
	plan: MasterSubscriptionPlanRecord,
): MasterSubscriptionPlanFormValues {
	return {
		billingCycle: plan.billingCycle,
		code: plan.code,
		description: plan.description,
		includedBranches: plan.includedBranches,
		includedCompanies: plan.includedCompanies,
		includedUsers: plan.includedUsers,
		moduleIds: [...plan.moduleIds],
		monthlyBasePrice: plan.monthlyBasePrice,
		name: plan.name,
		pricing: { ...plan.pricing },
		status: plan.status,
	};
}

export function createMasterSubscriptionPlanRecord({
	id,
	values,
}: {
	id: string;
	values: MasterSubscriptionPlanFormValues;
}): MasterSubscriptionPlanRecord {
	return {
		...values,
		code: values.code.trim().toUpperCase(),
		description: values.description.trim(),
		id,
		moduleIds: [...values.moduleIds],
		name: values.name.trim(),
		pricing: { ...values.pricing },
	};
}

export function getMasterSubscriptionPlanById(planId: string) {
	return MasterSubscriptionPlans.find((plan) => plan.id === planId);
}

export function getMasterSubscriptionPlanName(planId: string) {
	return getMasterSubscriptionPlanById(planId)?.name ?? "Unknown plan";
}

export function getMasterSubscriptionCompanyById(subscriberId: string) {
	return MasterSubscriptionCompanies.find(
		(subscriber) => subscriber.id === subscriberId,
	);
}

export function calculateMasterSubscriptionQuote({
	plan,
	rules,
	values,
}: {
	plan: MasterSubscriptionPlanRecord;
	rules: MasterSubscriptionVolumeRuleRecord[];
	values: MasterSubscriptionPreviewValues;
}): MasterSubscriptionQuote {
	const companyQuote = calculateUnitQuote({
		actualCount: values.companies,
		includedCount: plan.includedCompanies,
		planId: plan.id,
		rate: plan.pricing.company,
		rules,
		unit: "company",
	});
	const branchQuote = calculateUnitQuote({
		actualCount: values.branches,
		includedCount: plan.includedBranches,
		planId: plan.id,
		rate: plan.pricing.branch,
		rules,
		unit: "branch",
	});
	const userQuote = calculateUnitQuote({
		actualCount: values.users,
		includedCount: plan.includedUsers,
		planId: plan.id,
		rate: plan.pricing.user,
		rules,
		unit: "user",
	});
	const rawOverageTotal = [companyQuote, branchQuote, userQuote].reduce(
		(total, quote) => total + quote.extraCount * quote.rate,
		0,
	);
	const overageTotal =
		companyQuote.charge + branchQuote.charge + userQuote.charge;
	const effectiveDiscountPercent = rawOverageTotal
		? Math.round(((rawOverageTotal - overageTotal) / rawOverageTotal) * 100)
		: 0;

	return {
		basePrice: plan.monthlyBasePrice,
		branchCharge: branchQuote.charge,
		companyCharge: companyQuote.charge,
		effectiveDiscountPercent,
		total: plan.monthlyBasePrice + overageTotal,
		unitQuotes: [companyQuote, branchQuote, userQuote],
		userCharge: userQuote.charge,
	};
}

export function formatMasterSubscriptionCurrency(value: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		maximumFractionDigits: 0,
		style: "currency",
	}).format(value);
}

export function formatMasterSubscriptionDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

export function calculateMasterSubscriptionAmountLeft({
	billingCycle,
	monthlyTotal,
}: {
	billingCycle: MasterSubscriptionBillingCycle;
	monthlyTotal: number;
}) {
	return monthlyTotal * getMasterSubscriptionBillingCycleMonthMultiplier(
		billingCycle,
	);
}

function calculateUnitQuote({
	actualCount,
	includedCount,
	planId,
	rate,
	rules,
	unit,
}: {
	actualCount: number;
	includedCount: number;
	planId: string;
	rate: number;
	rules: MasterSubscriptionVolumeRuleRecord[];
	unit: MasterSubscriptionUnit;
}): MasterSubscriptionUnitQuote {
	const safeActualCount = Math.max(0, Math.floor(actualCount));
	const extraCount = Math.max(0, safeActualCount - includedCount);
	let charge = 0;

	for (
		let currentUnitCount = includedCount + 1;
		currentUnitCount <= safeActualCount;
		currentUnitCount += 1
	) {
		const discountPercent = getDiscountPercentForCount({
			count: currentUnitCount,
			planId,
			rules,
			unit,
		});

		charge += rate * (1 - discountPercent / 100);
	}

	return {
		charge: Math.round(charge),
		extraCount,
		rate,
		unit,
	};
}

function getMasterSubscriptionBillingCycleMonthMultiplier(
	billingCycle: MasterSubscriptionBillingCycle,
) {
	switch (billingCycle) {
		case "Annual":
			return 12;
		case "Every 3 months":
			return 3;
		case "Monthly":
		case "Per transaction":
			return 1;
	}
}

function getDiscountPercentForCount({
	count,
	planId,
	rules,
	unit,
}: {
	count: number;
	planId: string;
	rules: MasterSubscriptionVolumeRuleRecord[];
	unit: MasterSubscriptionUnit;
}) {
	return rules
		.filter(
			(rule) =>
				rule.planId === planId &&
				rule.unit === unit &&
				count >= rule.startsAt &&
				(rule.endsAt === null || count <= rule.endsAt),
		)
		.reduce(
			(highestDiscount, rule) =>
				Math.max(highestDiscount, rule.discountPercent),
			0,
	);
}

function createMasterSubscriptionPlanFromPackage(
	record: MasterPlanAndPackageRecord,
): MasterSubscriptionPlanRecord {
	return {
		billingCycle: getBillingCycleFromPricing(record.pricing),
		code: createPlanCode(record.name),
		description: record.description,
		id: record.id,
		includedBranches: getIncludedCountFromScaleRule(record.scalePricing.branch),
		includedCompanies: getIncludedCountFromScaleRule(
			record.scalePricing.company,
		),
		includedUsers: getIncludedCountFromScaleRule(record.scalePricing.user),
		moduleIds: [...record.featureIds],
		monthlyBasePrice: getMonthlyBasePrice(record.pricing),
		name: record.name,
		pricing: {
			branch: getUnitPriceFromScaleRule(record.scalePricing.branch),
			company: getUnitPriceFromScaleRule(record.scalePricing.company),
			user: getUnitPriceFromScaleRule(record.scalePricing.user),
		},
		status: record.status,
	};
}

function getBillingCycleFromPricing(
	pricing: MasterPlanAndPackagePricing,
): MasterSubscriptionBillingCycle {
	switch (pricing.kind) {
		case "Interval":
			return pricing.intervalMonths === 3 ? "Every 3 months" : "Monthly";
		case "Yearly":
			return "Annual";
		case "Transactional":
			return "Per transaction";
		case "Monthly":
		case "Percent Off":
			return "Monthly";
	}
}

function getMonthlyBasePrice(pricing: MasterPlanAndPackagePricing) {
	switch (pricing.kind) {
		case "Interval":
			return pricing.amount / pricing.intervalMonths;
		case "Monthly":
		case "Transactional":
			return pricing.amount;
		case "Percent Off":
			return pricing.baseAmount * (1 - pricing.percentOff / 100);
		case "Yearly":
			return pricing.amount / 12;
	}
}

function getIncludedCountFromScaleRule(rule: MasterPlanAndPackageScaleRule) {
	switch (rule.kind) {
		case "Add-on":
			return rule.includedFreeCount;
		case "Range":
			return rule.maxCount;
		case "Reduction": {
			const firstThreshold = Math.min(
				...rule.tiers.map((tier) => tier.thresholdCount),
			);

			return Number.isFinite(firstThreshold)
				? Math.max(0, firstThreshold - 1)
				: 0;
		}
	}
}

function getUnitPriceFromScaleRule(rule: MasterPlanAndPackageScaleRule) {
	if (rule.kind === "Add-on") {
		return rule.addOnPrice;
	}

	return 0;
}

function createPlanCode(name: string) {
	const code = name
		.split(/\s+/)
		.map((part) => part.charAt(0))
		.join("")
		.toUpperCase();

	return code.slice(0, 16) || "PLAN";
}
