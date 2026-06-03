import type {
  WorkspaceCompanyBranchRecord,
  WorkspaceCompanyFormValues,
  WorkspaceCompanyRecord,
  WorkspaceCompanyUserFormValues,
  WorkspaceCompanyUserRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export type WorkspaceCompanyManagementStoreState = {
  branches: WorkspaceCompanyBranchRecord[];
  companies: WorkspaceCompanyRecord[];
  isLoading: boolean;
  isMutating: boolean;
  users: WorkspaceCompanyUserRecord[];
  addCompany: (
    values: WorkspaceCompanyFormValues,
  ) => Promise<WorkspaceCompanyRecord>;
  addCompanyUser: (
    values: WorkspaceCompanyUserFormValues,
  ) => Promise<WorkspaceCompanyUserRecord>;
  cancelCompanyUserInvitation: (
    userId: string,
  ) => Promise<{ id: number; message: string }>;
  deactivateCompany: (companyId: string) => Promise<WorkspaceCompanyRecord>;
  deleteCompany: (companyId: string) => Promise<WorkspaceCompanyRecord>;
  resendCompanyUserInvitation: (userId: string) => Promise<{ message: string }>;
  updateCompany: (
    companyId: string,
    values: WorkspaceCompanyFormValues,
  ) => Promise<WorkspaceCompanyRecord>;
  updateCompanyUser: (
    userId: string,
    values: WorkspaceCompanyUserFormValues,
  ) => Promise<WorkspaceCompanyUserRecord>;
};

export const EmptyWorkspaceCompanies: WorkspaceCompanyRecord[] = [];
export const EmptyWorkspaceCompanyUsers: WorkspaceCompanyUserRecord[] = [];
export const EmptyWorkspaceCompanyBranches: WorkspaceCompanyBranchRecord[] = [];
