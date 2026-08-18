import type { MasterAddOnRecord } from "@/app/src/types/master/add-ons/MasterAddOnTypes";

export const MasterAddOnMockRecords: MasterAddOnRecord[] = [
	{
		id: "addon-001",
		code: "ADV_REPORTING",
		name: "Advanced Reporting",
		description:
			"Unlock comprehensive financial reports, custom dashboards, and advanced analytics beyond the standard plan.",
		status: "Active",
		featureIds: ["feat-fin-reports", "feat-analytics-dashboard"],
		pricing: {
			monthlyPrice: 199,
			yearlyPrice: 1990,
		},
		createdAt: "2026-01-15T08:00:00Z",
		updatedAt: "2026-06-10T14:30:00Z",
	},
	{
		id: "addon-002",
		code: "API_ACCESS",
		name: "API Access & Integration",
		description:
			"Enable REST API endpoints and webhook integrations for third-party system connectivity.",
		status: "Active",
		featureIds: ["feat-rest-api", "feat-webhooks"],
		pricing: {
			monthlyPrice: 499,
			yearlyPrice: 4990,
		},
		createdAt: "2026-02-01T08:00:00Z",
		updatedAt: "2026-07-05T09:15:00Z",
	},
	{
		id: "addon-003",
		code: "MULTI_CURRENCY",
		name: "Multi-Currency Support",
		description:
			"Handle transactions in multiple currencies with automatic exchange rate updates and multi-currency journal entries.",
		status: "Active",
		featureIds: [
			"feat-currency-exchange",
			"feat-multi-currency-journal",
			"feat-forex-gain-loss",
		],
		pricing: {
			monthlyPrice: 299,
			yearlyPrice: 2990,
		},
		createdAt: "2026-03-10T08:00:00Z",
		updatedAt: "2026-08-01T11:45:00Z",
	},
	{
		id: "addon-004",
		code: "HR_PAYROLL",
		name: "HR & Payroll Suite",
		description:
			"Complete human resources management including employee records, payroll processing, leave tracking, and time attendance.",
		status: "Inactive",
		featureIds: [
			"feat-employee-mgmt",
			"feat-payroll",
			"feat-time-tracking",
			"feat-leave-mgmt",
		],
		pricing: {
			monthlyPrice: 599,
			yearlyPrice: 5990,
		},
		createdAt: "2026-05-20T08:00:00Z",
		updatedAt: "2026-08-12T16:00:00Z",
	},
	{
		id: "addon-005",
		code: "FIXED_ASSET_MGR",
		name: "Fixed Asset Manager",
		description:
			"Track fixed assets, compute depreciation schedules, and manage asset disposal and impairment records.",
		status: "Inactive",
		featureIds: ["feat-asset-register", "feat-depreciation"],
		pricing: {
			monthlyPrice: 149,
			yearlyPrice: 1490,
		},
		createdAt: "2026-04-08T08:00:00Z",
		updatedAt: "2026-07-28T10:20:00Z",
	},
];
