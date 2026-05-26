import type {
	MasterCompanyManagementGroupBy,
	MasterCompanyManagementSortBy,
	MasterCompanyManagementTableColumnKey,
} from "@/app/src/types/master/company-management/MasterCompanyManagementTypes";

export const MasterCompaniesHref = "/master/company-management";

export const MasterCompanyManagementPaginationStorageKey =
	"master-company-management";

export const MasterCompanyManagementGroupOptions = [
	{ label: "No grouping", value: "none" },
	{ label: "Plan", value: "plan" },
	{ label: "Status", value: "status" },
	{ label: "Billing cycle", value: "billingCycle" },
] as const satisfies readonly {
	label: string;
	value: MasterCompanyManagementGroupBy;
}[];

export const MasterCompanyManagementSortOptions = [
	{ label: "Company name", value: "name" },
	{ label: "MRR high to low", value: "monthlyRecurringRevenue" },
	{ label: "Renewal date", value: "renewalDate" },
	{ label: "Active users", value: "activeUsers" },
] as const satisfies readonly {
	label: string;
	value: MasterCompanyManagementSortBy;
}[];

export const MasterCompanyManagementTableColumns = [
	{ key: "name", label: "Company", className: "w-[20rem]" },
	{ key: "plan", label: "Plan", className: "w-[13rem]" },
	{ key: "status", label: "Status", className: "w-[10rem]" },
	{ key: "billingCycle", label: "Cycle", className: "w-[10rem]" },
	{ key: "activeUsers", label: "Users", className: "w-[7rem]" },
	{ key: "branchCount", label: "Branches", className: "w-[8rem]" },
	{ key: "monthlyRecurringRevenue", label: "MRR", className: "w-[9rem]" },
	{ key: "renewalDate", label: "Renewal", className: "w-[10rem]" },
	{ label: "Actions", className: "w-[7rem] text-center" },
] as const satisfies readonly (
	| {
			key: MasterCompanyManagementTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];
