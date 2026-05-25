import type {
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

export const MasterSubscriptionPlans: MasterSubscriptionPlanRecord[] = [
	{
		billingCycle: "Monthly",
		code: "CORE",
		description:
			"Entry plan for small teams that need accounting, billing, and core controls.",
		id: "core-books",
		includedBranches: 1,
		includedCompanies: 1,
		includedUsers: 3,
		moduleIds: ["accounting-core", "sales-billing", "admin-security"],
		monthlyBasePrice: 2900,
		name: "Core Books",
		pricing: {
			branch: 450,
			company: 900,
			user: 250,
		},
		status: "Active",
	},
	{
		billingCycle: "Monthly",
		code: "GROWTH",
		description:
			"Operational plan for growing companies with purchasing, payables, and branch expansion.",
		id: "growth-suite",
		includedBranches: 3,
		includedCompanies: 5,
		includedUsers: 12,
		moduleIds: [
			"accounting-core",
			"sales-billing",
			"purchase-payables",
			"multi-entity",
			"admin-security",
		],
		monthlyBasePrice: 7900,
		name: "Growth Suite",
		pricing: {
			branch: 380,
			company: 700,
			user: 220,
		},
		status: "Active",
	},
	{
		billingCycle: "Monthly",
		code: "ENTERPRISE",
		description:
			"Full platform plan for multi-company groups that need accounting, inventory, controls, and volume pricing.",
		id: "enterprise-ops",
		includedBranches: 10,
		includedCompanies: 10,
		includedUsers: 30,
		moduleIds: MasterSubscriptionModules.map((moduleOption) => moduleOption.id),
		monthlyBasePrice: 15900,
		name: "Enterprise Ops",
		pricing: {
			branch: 300,
			company: 520,
			user: 180,
		},
		status: "Active",
	},
];

export const MasterSubscriptionVolumeRules: MasterSubscriptionVolumeRuleRecord[] =
	[
		{
			discountPercent: 12,
			endsAt: 20,
			id: "rule-enterprise-company-11",
			label: "Company scale 11 to 20",
			planId: "enterprise-ops",
			startsAt: 11,
			unit: "company",
		},
		{
			discountPercent: 20,
			endsAt: null,
			id: "rule-enterprise-company-21",
			label: "Company scale 21+",
			planId: "enterprise-ops",
			startsAt: 21,
			unit: "company",
		},
		{
			discountPercent: 10,
			endsAt: null,
			id: "rule-enterprise-branch-16",
			label: "Satellite branch scale 16+",
			planId: "enterprise-ops",
			startsAt: 16,
			unit: "branch",
		},
		{
			discountPercent: 8,
			endsAt: 25,
			id: "rule-growth-company-6",
			label: "Company scale 6 to 25",
			planId: "growth-suite",
			startsAt: 6,
			unit: "company",
		},
	];

export const MasterSubscriptionCompanies: MasterSubscriptionCompanyRecord[] = [
	{
		billingCycle: "Monthly",
		branchCount: 3,
		companyCount: 4,
		id: "sub-gr8books",
		name: "Gr8Books HQ",
		ownerName: "John Dela Cruz",
		planId: "growth-suite",
		renewalDate: "2026-06-01",
		status: "Active",
		userCount: 15,
	},
	{
		billingCycle: "Monthly",
		branchCount: 1,
		companyCount: 1,
		id: "sub-demo-trading",
		name: "Demo Trading Corp.",
		ownerName: "Jane Santos",
		planId: "core-books",
		renewalDate: "2026-06-05",
		status: "Trial",
		userCount: 4,
	},
	{
		billingCycle: "Annual",
		branchCount: 14,
		companyCount: 12,
		id: "sub-laguna-manufacturing",
		name: "Laguna Manufacturing Inc.",
		ownerName: "Emily Lim",
		planId: "enterprise-ops",
		renewalDate: "2027-05-10",
		status: "Active",
		userCount: 42,
	},
	{
		billingCycle: "Monthly",
		branchCount: 18,
		companyCount: 24,
		id: "sub-visayas-retail",
		name: "Visayas Retail Group",
		ownerName: "Miguel Reyes",
		planId: "enterprise-ops",
		renewalDate: "2026-05-28",
		status: "Past Due",
		userCount: 65,
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
