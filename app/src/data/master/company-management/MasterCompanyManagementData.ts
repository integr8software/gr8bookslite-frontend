import type { MasterCompanyManagementRecord } from "@/app/src/types/master/company-management/MasterCompanyManagementTypes";

export const MasterCompanyManagementRecords: MasterCompanyManagementRecord[] = [
	{
		id: "sub-gr8books",
		workspaceCompanyId: "cmp-gr8books",
		name: "Gr8Books HQ",
		email: "admin@gr8books.test",
		ownerName: "John Dela Cruz",
		plan: "Accounting + Inventory",
		status: "Active",
		billingCycle: "Annual",
		activeUsers: 3,
		branchCount: 3,
		monthlyRecurringRevenue: 18900,
		renewalDate: "2027-05-01",
		startedAt: "2026-05-01",
	},
	{
		id: "sub-demo-trading",
		workspaceCompanyId: "cmp-demo-trading",
		name: "Demo Trading Corp.",
		email: "finance@demotrading.test",
		ownerName: "Jane Santos",
		plan: "Accounting",
		status: "Active",
		billingCycle: "Monthly",
		activeUsers: 1,
		branchCount: 1,
		monthlyRecurringRevenue: 5900,
		renewalDate: "2026-06-05",
		startedAt: "2026-05-05",
	},
	{
		id: "sub-cebu-retail",
		workspaceCompanyId: "cmp-cebu-retail",
		name: "Cebu Retail Partners",
		email: "ops@ceburetail.test",
		ownerName: "Michael Reyes",
		plan: "Inventory",
		status: "Trial",
		billingCycle: "Monthly",
		activeUsers: 1,
		branchCount: 1,
		monthlyRecurringRevenue: 3900,
		renewalDate: "2026-06-08",
		startedAt: "2026-05-08",
	},
	{
		id: "sub-laguna-manufacturing",
		workspaceCompanyId: "cmp-laguna-manufacturing",
		name: "Laguna Manufacturing Inc.",
		email: "control@lagunamfg.test",
		ownerName: "Emily Lim",
		plan: "Accounting + Inventory",
		status: "Past Due",
		billingCycle: "Quarterly",
		activeUsers: 0,
		branchCount: 0,
		monthlyRecurringRevenue: 15900,
		renewalDate: "2026-05-28",
		startedAt: "2026-05-10",
	},
];

export function formatMasterCompanyCurrency(value: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		maximumFractionDigits: 0,
		style: "currency",
	}).format(value);
}

export function formatMasterCompanyDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}
