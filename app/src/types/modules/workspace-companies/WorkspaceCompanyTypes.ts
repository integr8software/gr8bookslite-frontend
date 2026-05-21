export type WorkspaceCompanyStatus = "Active" | "Inactive" | "Pending";

export type WorkspaceCompanyPlan =
  | "Accounting"
  | "Inventory"
  | "Accounting + Inventory";

export type WorkspaceCompanyType =
  | "Corporation"
  | "Partnership"
  | "Single Proprietorship"
  | "Non-Profit";

export type WorkspaceCompanyActionMode = "add" | "edit" | "view";

export type WorkspaceCompanyRecord = {
  id: string;
  name: string;
  initials: string;
  logoUrl?: string;
  companyType: WorkspaceCompanyType;
  plan: WorkspaceCompanyPlan;
  status: WorkspaceCompanyStatus;
  email: string;
  contactNumber: string;
  address: string;
  primaryContact: string;
  createdAt: string;
};

export type WorkspaceCompanyFormValues = Omit<
  WorkspaceCompanyRecord,
  "id" | "initials" | "createdAt"
>;

export type WorkspaceCompanyFormErrors = Partial<
  Record<keyof WorkspaceCompanyFormValues, string>
>;

export type WorkspaceCompanyUserRole =
  | "Company Admin"
  | "Accountant"
  | "Bookkeeper"
  | "Approver"
  | "Viewer";

export type WorkspaceCompanyUserRecord = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  contactNumber: string;
  role: WorkspaceCompanyUserRole;
  status: WorkspaceCompanyStatus;
  lastLogin?: string;
  profileImageUrl?: string;
};

export type WorkspaceCompanyUserFormValues = Omit<
  WorkspaceCompanyUserRecord,
  "id" | "companyId" | "lastLogin" | "profileImageUrl"
>;

export type WorkspaceCompanyUserFormErrors = Partial<
  Record<keyof WorkspaceCompanyUserFormValues, string>
>;

export type WorkspaceCompanyBranchKind = "Head Office" | "Branch" | "Satellite";

export type WorkspaceCompanyBranchRecord = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  branchType: WorkspaceCompanyBranchKind;
  status: WorkspaceCompanyStatus;
  tin: string;
  email: string;
  contactNumber: string;
  address: string;
};

export type WorkspaceCompanyBranchFormValues = Omit<
  WorkspaceCompanyBranchRecord,
  "id" | "companyId"
>;

export type WorkspaceCompanyBranchFormErrors = Partial<
  Record<keyof WorkspaceCompanyBranchFormValues, string>
>;

export type WorkspaceBranchUserRole =
  | "Branch Admin"
  | "Branch Accountant"
  | "Cashier"
  | "Encoder"
  | "Approver"
  | "Auditor";

export type WorkspaceBranchUserRecord = {
  id: string;
  companyId: string;
  branchId: string;
  name: string;
  email: string;
  contactNumber: string;
  role: WorkspaceBranchUserRole;
  status: WorkspaceCompanyStatus;
  assignedAt: string;
};

export type WorkspaceBranchUserFormValues = Omit<
  WorkspaceBranchUserRecord,
  "id" | "companyId" | "branchId" | "assignedAt"
>;

export type WorkspaceBranchUserFormErrors = Partial<
  Record<keyof WorkspaceBranchUserFormValues, string>
>;

export type WorkspaceCompanyTableRecord = WorkspaceCompanyRecord & {
  totalBranches: number;
  totalUsers: number;
};

export type WorkspaceCompanyUserTableRecord = WorkspaceCompanyUserRecord;

export type WorkspaceCompanyBranchTableRecord = WorkspaceCompanyBranchRecord & {
  totalUsers: number;
};

export type WorkspaceBranchUserTableRecord = WorkspaceBranchUserRecord;

export type WorkspaceCompanyTableColumnKey = keyof Pick<
  WorkspaceCompanyTableRecord,
  "name" | "totalBranches" | "totalUsers" | "companyType" | "plan" | "status"
>;

export type WorkspaceCompanyUserTableColumnKey = keyof Pick<
  WorkspaceCompanyUserTableRecord,
  "name" | "email" | "role" | "status" | "lastLogin"
>;

export type WorkspaceCompanyBranchTableColumnKey = keyof Pick<
  WorkspaceCompanyBranchTableRecord,
  "code" | "name" | "branchType" | "totalUsers" | "status"
>;

export type WorkspaceBranchUserTableColumnKey = keyof Pick<
  WorkspaceBranchUserTableRecord,
  "name" | "email" | "role" | "status" | "assignedAt"
>;
