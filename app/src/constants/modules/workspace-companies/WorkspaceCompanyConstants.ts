import type {
	WorkspaceBranchUserRole,
	WorkspaceBranchUserTableColumnKey,
	WorkspaceCompanyBranchKind,
	WorkspaceCompanyBranchTableColumnKey,
	WorkspaceCompanyPlan,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableColumnKey,
	WorkspaceCompanyType,
	WorkspaceCompanyUserRole,
	WorkspaceCompanyUserTableColumnKey,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";

export const WorkspaceCompaniesHref = "/workspace/companies";

export const WorkspaceCompanyEditFromParam = "from";

export const WorkspaceCompanyEditFromViewValue = "view";

export const WorkspaceCompanyEditFromViewQuery = `${WorkspaceCompanyEditFromParam}=${WorkspaceCompanyEditFromViewValue}`;

export const WorkspaceCompanyStatusOptions = [
	"Active",
	"Pending",
	"Inactive",
] as const satisfies readonly WorkspaceCompanyStatus[];

export const WorkspaceCompanyTypeOptions = [
	"Corporation",
	"Partnership",
	"Single Proprietorship",
	"Non-Profit",
] as const satisfies readonly WorkspaceCompanyType[];

export const WorkspaceCompanyPlanOptions = [
	"Accounting",
	"Inventory",
	"Accounting + Inventory",
] as const satisfies readonly WorkspaceCompanyPlan[];

export const WorkspaceCompanyUserRoleOptions = [
	"Company Admin",
	"Accountant",
	"Bookkeeper",
	"Approver",
	"Viewer",
] as const satisfies readonly WorkspaceCompanyUserRole[];

export const WorkspaceCompanyBranchKindOptions = [
	"Head Office",
	"Branch",
	"Satellite",
] as const satisfies readonly WorkspaceCompanyBranchKind[];

export const WorkspaceBranchUserRoleOptions = [
	"Branch Admin",
	"Branch Accountant",
	"Cashier",
	"Encoder",
	"Approver",
	"Auditor",
] as const satisfies readonly WorkspaceBranchUserRole[];

export const WorkspaceCompaniesTablePaginationStorageKey =
	"workspace-companies";

export const WorkspaceCompanyUsersTablePaginationStorageKey =
	"workspace-company-users";

export const WorkspaceCompanyBranchesTablePaginationStorageKey =
	"workspace-company-branches";

export const WorkspaceBranchUsersTablePaginationStorageKey =
	"workspace-branch-users";

export const WorkspaceCompanyTableColumns = [
	{ key: "name", label: "Company", className: "w-[20rem]" },
	{ key: "totalBranches", label: "Branches", className: "w-[7rem]" },
	{ key: "totalUsers", label: "Users", className: "w-[6rem]" },
	{ key: "companyType", label: "Type", className: "w-[12rem]" },
	{ key: "plan", label: "Plan", className: "w-[13rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ label: "Actions", className: "w-[7rem] text-center" },
] as const satisfies readonly (
	| {
			key: WorkspaceCompanyTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];

export const WorkspaceCompanyUserTableColumns = [
	{ key: "name", label: "User", className: "w-[18rem]" },
	{ key: "email", label: "Email", className: "w-[20rem]" },
	{ key: "role", label: "Role", className: "w-[12rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "lastLogin", label: "Last Login", className: "w-[13rem]" },
	{ label: "Actions", className: "w-[7rem] text-center" },
] as const satisfies readonly (
	| {
			key: WorkspaceCompanyUserTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];

export const WorkspaceCompanyBranchTableColumns = [
	{ key: "code", label: "Code", className: "w-[7rem]" },
	{ key: "name", label: "Branch", className: "w-[19rem]" },
	{ key: "branchType", label: "Type", className: "w-[11rem]" },
	{ key: "totalUsers", label: "Users", className: "w-[8rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ label: "Actions", className: "w-[9rem] text-center" },
] as const satisfies readonly (
	| {
			key: WorkspaceCompanyBranchTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];

export const WorkspaceBranchUserTableColumns = [
	{ key: "name", label: "Branch User", className: "w-[18rem]" },
	{ key: "email", label: "Email", className: "w-[20rem]" },
	{ key: "role", label: "Branch Role", className: "w-[13rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "assignedAt", label: "Assigned", className: "w-[12rem]" },
	{ label: "Actions", className: "w-[7rem] text-center" },
] as const satisfies readonly (
	| {
			key: WorkspaceBranchUserTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];

export function getWorkspaceCompanyHref(companyId: string) {
	return `${WorkspaceCompaniesHref}/${companyId}`;
}

export function getWorkspaceCompanyEditHref(companyId: string) {
	return `${getWorkspaceCompanyHref(companyId)}/edit`;
}

export function getWorkspaceCompanyUsersHref(companyId: string) {
	return `${getWorkspaceCompanyHref(companyId)}/users`;
}

export function getWorkspaceCompanyBranchesHref(companyId: string) {
	return `${getWorkspaceCompanyHref(companyId)}/branches`;
}

export function getWorkspaceCompanyBranchUsersHref(
	companyId: string,
	branchId: string,
) {
	return `${getWorkspaceCompanyBranchesHref(companyId)}/${branchId}/users`;
}
