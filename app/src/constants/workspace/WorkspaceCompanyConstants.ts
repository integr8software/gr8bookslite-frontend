import type {
	WorkspaceCompanyPlan,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableColumnKey,
	WorkspaceCompanyType,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export const WorkspaceCompaniesHref = "/workspace/company-management";

export const WorkspaceUsersManagementHref = "/workspace/users-management";

export const WorkspaceCompanyNotFoundDescription =
	"The record may have been moved, set inactive, or removed from the workspace data.";

export const WorkspaceCompanyEditFromParam = "from";

export const WorkspaceCompanyEditFromViewValue = "view";

export const WorkspaceCompanyEditFromViewQuery = `${WorkspaceCompanyEditFromParam}=${WorkspaceCompanyEditFromViewValue}`;

export const WorkspaceCompanyStatusOptions = [
	"Active",
	"Pending",
	"Inactive",
] as const satisfies readonly WorkspaceCompanyStatus[];

export const WorkspaceCompanyTypeOptions = [
	"Individual",
	"Corporation",
	"Partnership",
	"Association",
	"Non Stock",
	"Non Profit Organization",
	"Others",
] as const satisfies readonly WorkspaceCompanyType[];

export const WorkspaceCompanyPlanOptions = [
	"Accounting",
	"Inventory",
	"Accounting + Inventory",
] as const satisfies readonly WorkspaceCompanyPlan[];

export const WorkspaceCompaniesTablePaginationStorageKey =
	"workspace-companies";

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

export function getWorkspaceCompanyHref(companyId: string) {
	return `${WorkspaceCompaniesHref}/view/${companyId}`;
}

export function getWorkspaceCompanyEditHref(companyId: string) {
	return `${WorkspaceCompaniesHref}/edit/${companyId}`;
}
