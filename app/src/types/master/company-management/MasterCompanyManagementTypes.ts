export type MasterCompanySubscriptionPlan =
	| "Accounting"
	| "Inventory"
	| "Accounting + Inventory";

export type MasterCompanySubscriptionStatus =
	| "Active"
	| "Trial"
	| "Past Due"
	| "Inactive";

export type MasterCompanyBillingCycle = "Monthly" | "Quarterly" | "Annual";

export type MasterCompanyManagementRecord = {
	id: string;
	workspaceCompanyId: string;
	name: string;
	email: string;
	ownerName: string;
	plan: MasterCompanySubscriptionPlan;
	status: MasterCompanySubscriptionStatus;
	billingCycle: MasterCompanyBillingCycle;
	activeUsers: number;
	branchCount: number;
	monthlyRecurringRevenue: number;
	renewalDate: string;
	startedAt: string;
};

export type MasterCompanyManagementGroupBy =
	| "none"
	| "plan"
	| "status"
	| "billingCycle";

export type MasterCompanyManagementSortBy =
	| "name"
	| "monthlyRecurringRevenue"
	| "renewalDate"
	| "activeUsers";

export type MasterCompanyManagementTableColumnKey = keyof Pick<
	MasterCompanyManagementRecord,
	| "name"
	| "plan"
	| "status"
	| "billingCycle"
	| "activeUsers"
	| "branchCount"
	| "monthlyRecurringRevenue"
	| "renewalDate"
>;
