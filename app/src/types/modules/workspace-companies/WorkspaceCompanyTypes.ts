export type WorkspaceCompanyStatus = "Active" | "Inactive" | "Pending";

export type WorkspaceCompanyPlan =
  | "Accounting"
  | "Inventory"
  | "Accounting + Inventory";

export type WorkspaceCompanyType =
  | "Individual"
  | "Corporation"
  | "Partnership"
  | "Association"
  | "Non Stock"
  | "Non Profit Organization"
  | "Others";

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
  contactPerson?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nonIndividualType?: string;
  nonIndividualTypeOther?: string;
  reportEndDate?: string;
  reportStartDate?: string;
  taxpayerType?: "individual" | "non-individual";
  tin?: string;
  totalBranches?: number;
  totalUsers?: number;
  website?: string;
  billingCardBrand?: string;
  billingCardLast4?: string;
  billingPaymentMethodId?: string;
  billingPaymentMethodLabel?: string;
};

export type WorkspaceCompanyFormValues = {
  address: string;
  billingAddress: string;
  billingCardNumber: string;
  billingCardholderName: string;
  billingCvc: string;
  billingEmail: string;
  billingExpiryMonth: string;
  billingExpiryYear: string;
  billingPaymentMethodId: string;
  companyName: string;
  contactNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  logoFile: File | null;
  logoName: string;
  logoUrl: string;
  middleName: string;
  nonIndividualType: string;
  nonIndividualTypeOther: string;
  plan: WorkspaceCompanyPlan;
  reportEndDate: string;
  reportStartDate: string;
  status: WorkspaceCompanyStatus;
  taxpayerType: "individual" | "non-individual";
  tin: string;
  website: string;
};

export type WorkspaceCompanyFormErrors = Partial<
  Record<keyof WorkspaceCompanyFormValues, string>
>;

export type WorkspaceCompanyUserRecord = {
  id: string;
  companyId: string;
  companyAssignments: WorkspaceUserCompanyAssignment[];
  name: string;
  email: string;
  contactNumber: string;
  status: WorkspaceCompanyStatus;
  lastLogin?: string;
  profileImageUrl?: string;
};

export type WorkspaceUserCompanyAssignment = {
  companyId: string;
  branchIds: string[];
};

export type WorkspaceCompanyUserFormValues = {
  companyAssignments: WorkspaceUserCompanyAssignment[];
  contactNumber: string;
  email: string;
  name: string;
};

export type WorkspaceCompanyUserFormErrors = Partial<
  Record<keyof WorkspaceCompanyUserFormValues, string>
>;

export type WorkspaceCompanyBranchKind = "Branch" | "Satellite";

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
  isMain: boolean;
  linkedMainBranchId?: string;
};

export type WorkspaceCompanyBranchFormValues = {
  branchType: WorkspaceCompanyBranchKind;
  name: string;
  contactNumber: string;
  email: string;
  tin: string;
  linkedMainBranchId: string;
  address: string;
  isMain: boolean;
};

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

export type WorkspaceCompanyBranchTableRecord = WorkspaceCompanyBranchRecord;

export type WorkspaceBranchUserTableRecord = WorkspaceBranchUserRecord;

export type WorkspaceCompanyTableColumnKey = keyof Pick<
  WorkspaceCompanyTableRecord,
  "name" | "totalBranches" | "totalUsers" | "companyType" | "plan" | "status"
>;

export type WorkspaceCompanyUserTableColumnKey = keyof Pick<
  WorkspaceCompanyUserTableRecord,
  "name" | "email" | "status" | "lastLogin"
>;

export type WorkspaceCompanyBranchTableColumnKey = keyof Pick<
  WorkspaceCompanyBranchTableRecord,
  "code" | "name" | "branchType" | "status"
>;

export type WorkspaceBranchUserTableColumnKey = keyof Pick<
  WorkspaceBranchUserTableRecord,
  "name" | "email" | "role" | "status" | "assignedAt"
>;
