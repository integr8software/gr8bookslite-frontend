export type WorkspaceCompanyStatus = "Active" | "Inactive" | "Pending";

export type WorkspaceUserStatus = WorkspaceCompanyStatus | "Suspended";

export type WorkspaceCompanyPlan = string;

export type WorkspaceCompanyType =
  "Individual" | "Corporation" | "Partnership" | "Association" | "Non Stock" | "Non Profit Organization" | "Others";

export type WorkspaceCompanyFormMode = "add" | "edit" | "view";

export type WorkspaceCompanyRecord = {
  id: string;
  name: string;
  initials: string;
  logoUrl?: string;
  companyType: WorkspaceCompanyType;
  plan: WorkspaceCompanyPlan;
  status: WorkspaceCompanyStatus;
  countryCode: string;
  baseCurrencyCode: string;
  email: string;
  contactNumber: string;
  address: string;
  primaryContact: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
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
  branches?: WorkspaceCompanyBranchRecord[];
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
  billingMode: "MANUAL" | "AUTO";
  billingPaymentMethodId: string;
  billingPlanCode: string;
  billingCycle: "MONTHLY" | "YEARLY";
  countryCode: string;
  baseCurrencyCode: string;
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

export type WorkspaceCompanyFormErrors = Partial<Record<keyof WorkspaceCompanyFormValues, string>>;

export type WorkspaceUserCompanyAssignment = {
  companyId: string;
  branchIds: string[];
  branches?: WorkspaceCompanyBranchRecord[];
};

export type WorkspaceCompanyUserRecord = {
  id: string;
  companyId: string;
  companyAssignments: WorkspaceUserCompanyAssignment[];
  name: string;
  email: string;
  contactNumber: string;
  status: WorkspaceUserStatus;
  createdAt: string;
  lastLogin?: string;
  profileImageUrl?: string;
};

export type WorkspaceCompanyUserFormValues = {
  companyAssignments: WorkspaceUserCompanyAssignment[];
  contactNumber: string;
  email: string;
  name: string;
};

export type WorkspaceCompanyUserFormErrors = Partial<Record<keyof WorkspaceCompanyUserFormValues, string>>;

export type WorkspaceCompanyUserApiAssignment = {
  companyId: number;
  unitIds: number[];
  units?: WorkspaceCompanyUserAssignedUnitApiRecord[];
};

export type WorkspaceCompanyUserAssignedUnitApiRecord = {
  id: number;
  companyId: number;
  type: WorkspaceCompanyUnitApiType;
  name: string;
  displayName: string | null;
  isActive: boolean;
};

export type WorkspaceCompanyUserApiStatus = "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";

export type WorkspaceCompanyUserApiRecord = {
  id: number;
  name: string;
  email: string;
  contactNumber: string | null;
  status: WorkspaceCompanyUserApiStatus;
  lastLogin: string | null;
  profileImageUrl: string | null;
  companyAssignments: WorkspaceCompanyUserApiAssignment[];
  createdAt: string;
  updatedAt: string | null;
};

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
  isMain: boolean;
  linkedMainBranchId?: string;
};

export type WorkspaceCompanyUnitApiType = "HEAD_OFFICE" | "BRANCH" | "SATELLITE";

export type WorkspaceCompanyUnitApiRecord = {
  id: number;
  companyId: number;
  parentUnitId: number | null;
  type: WorkspaceCompanyUnitApiType;
  code: string | null;
  name: string;
  displayName: string | null;
  tin: string | null;
  address: string | null;
  contactNumber: string | null;
  email: string | null;
  isActive: boolean;
  inheritsCompanyProfile: boolean;
  canTransactSales: boolean;
  canHoldInventory: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceCompanyTableRecord = WorkspaceCompanyRecord & {
  totalBranches: number;
  totalUsers: number;
};

export type WorkspaceCompanyTableColumnKey = keyof Pick<
  WorkspaceCompanyTableRecord,
  "name" | "totalBranches" | "totalUsers" | "companyType" | "plan" | "status"
>;

export type WorkspaceCompanyApiStatus = "ACTIVE" | "FAILED" | "PENDING" | "PROVISIONING" | "SUSPENDED";

export type WorkspaceCompanyApiTaxpayerType = "INDIVIDUAL" | "NON_INDIVIDUAL" | null;

export type WorkspaceCompanyApiRecord = {
  id: number;
  name: string;
  slug: string;
  legalName: string | null;
  companyCode: string | null;
  countryCode: string;
  baseCurrencyCode: string;
  taxpayerType: WorkspaceCompanyApiTaxpayerType;
  ownerLastName: string | null;
  ownerFirstName: string | null;
  ownerMiddleName: string | null;
  organizationType: string | null;
  organizationTypeOther: string | null;
  logoFileName: string | null;
  logoMimeType: string | null;
  logoStoragePath: string | null;
  logoPublicUrl: string | null;
  address: string | null;
  tin: string | null;
  email: string | null;
  website: string | null;
  contactNumber: string | null;
  reportStartDate: string | null;
  reportEndDate: string | null;
  createdByUserId: number | null;
  createdByUser: {
    id: number;
    name: string;
    email: string;
  } | null;
  isActive: boolean;
  status: WorkspaceCompanyApiStatus;
  subscriptionPlan: {
    code: string;
    name: string;
    currency: string;
    billingCycle: "MONTHLY" | "YEARLY";
    monthlyPriceInCents: number;
    yearlyPriceInCents: number;
  } | null;
  totalUsers?: number;
  totalUnits?: number;
  units?: WorkspaceCompanyUnitApiRecord[];
  createdAt: string;
  updatedAt: string;
};
