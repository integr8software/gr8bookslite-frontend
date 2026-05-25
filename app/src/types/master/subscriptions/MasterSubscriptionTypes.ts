export type MasterSubscriptionPlanStatus = "Active" | "Draft" | "Inactive";

export type MasterSubscriptionBillingCycle = "Monthly" | "Annual";

export type MasterSubscriptionUnit = "company" | "branch" | "user";

export type MasterSubscriptionModuleCategory =
	| "Accounting"
	| "Inventory"
	| "Operations"
	| "Administration";

export type MasterSubscriptionModuleOption = {
	category: MasterSubscriptionModuleCategory;
	description: string;
	id: string;
	name: string;
};

export type MasterSubscriptionPlanRecord = {
	billingCycle: MasterSubscriptionBillingCycle;
	code: string;
	description: string;
	id: string;
	includedBranches: number;
	includedCompanies: number;
	includedUsers: number;
	moduleIds: string[];
	monthlyBasePrice: number;
	name: string;
	pricing: Record<MasterSubscriptionUnit, number>;
	status: MasterSubscriptionPlanStatus;
};

export type MasterSubscriptionPlanFormValues = Pick<
	MasterSubscriptionPlanRecord,
	| "billingCycle"
	| "code"
	| "description"
	| "includedBranches"
	| "includedCompanies"
	| "includedUsers"
	| "moduleIds"
	| "monthlyBasePrice"
	| "name"
	| "pricing"
	| "status"
>;

export type MasterSubscriptionPlanFormErrors = Partial<
	Record<keyof MasterSubscriptionPlanFormValues, string>
>;

export type MasterSubscriptionVolumeRuleRecord = {
	discountPercent: number;
	endsAt: number | null;
	id: string;
	label: string;
	planId: string;
	startsAt: number;
	unit: MasterSubscriptionUnit;
};

export type MasterSubscriptionCompanyStatus =
	| "Active"
	| "Trial"
	| "Past Due"
	| "Scheduled";

export type MasterSubscriptionCompanyRating =
	| "Excellent"
	| "Good"
	| "Watch"
	| "At Risk";

export type MasterSubscriptionCompanyRecord = {
	billingCycle: MasterSubscriptionBillingCycle;
	branchCount: number;
	companyCount: number;
	durationMonths: number;
	id: string;
	name: string;
	ownerName: string;
	planId: string;
	rating: MasterSubscriptionCompanyRating;
	renewalDate: string;
	status: MasterSubscriptionCompanyStatus;
	userCount: number;
};

export type MasterSubscriptionPreviewValues = {
	branches: number;
	companies: number;
	users: number;
};

export type MasterSubscriptionUnitQuote = {
	charge: number;
	extraCount: number;
	rate: number;
	unit: MasterSubscriptionUnit;
};

export type MasterSubscriptionQuote = {
	basePrice: number;
	branchCharge: number;
	companyCharge: number;
	effectiveDiscountPercent: number;
	total: number;
	unitQuotes: MasterSubscriptionUnitQuote[];
	userCharge: number;
};

export type MasterSubscriptionTableColumnKey = keyof Pick<
	MasterSubscriptionCompanyRecord,
	| "name"
	| "status"
	| "billingCycle"
	| "companyCount"
	| "branchCount"
	| "userCount"
	| "durationMonths"
	| "rating"
	| "renewalDate"
>;
