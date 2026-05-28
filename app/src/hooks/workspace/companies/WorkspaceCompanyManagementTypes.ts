import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyFormValues,
	WorkspaceCompanyRecord,
	WorkspaceCompanyUserRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export type WorkspaceCompanyManagementStoreState = {
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
	isLoading: boolean;
	isMutating: boolean;
	users: WorkspaceCompanyUserRecord[];
	addCompany: (values: WorkspaceCompanyFormValues) => Promise<WorkspaceCompanyRecord>;
	addCompanyUser: (user: WorkspaceCompanyUserRecord) => void;
	deleteCompany: (companyId: string) => Promise<WorkspaceCompanyRecord>;
	updateCompany: (
		companyId: string,
		values: WorkspaceCompanyFormValues,
	) => Promise<WorkspaceCompanyRecord>;
	updateCompanyUser: (user: WorkspaceCompanyUserRecord) => void;
};

export const EmptyWorkspaceCompanies: WorkspaceCompanyRecord[] = [];
export const EmptyWorkspaceCompanyUsers: WorkspaceCompanyUserRecord[] = [];
export const EmptyWorkspaceCompanyBranches: WorkspaceCompanyBranchRecord[] = [];
