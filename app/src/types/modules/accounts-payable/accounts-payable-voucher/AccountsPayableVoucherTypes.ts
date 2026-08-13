export type AccountsPayableVoucherStatus =
  "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";

export type AccountsPayableVoucherPayableType =
  "Trade Payable" | "Non-Trade Payable" | "Employee Payable" | "Tax Payable" | "Accrued Payable";

export type AccountsPayableVoucherLookupAddress = {
  id: string;
  addressName: string;
  addressLine1: string;
  addressLine2: string;
  barangay: string;
  barangayCode: string;
  cityMunicipality: string;
  cityMunicipalityCode: string;
  isBilling: boolean;
  isBuilding?: boolean;
  isDefault: boolean;
  isDelivery: boolean;
  isForeign?: boolean;
  isHome?: boolean;
  province: string;
  provinceCode: string;
  region: string;
  regionCode: string;
};

export type AccountsPayableVoucherLookupParty = {
  id: string;
  partyCodeNo: string;
  classification: "INDIVIDUAL" | "NON_INDIVIDUAL" | "Individual" | "Non-Individual";
  partyTypes: Array<"VENDOR" | "EMPLOYEE" | "Vendor" | "Employee" | string>;
  status: "ACTIVE" | "Active";
  name: string;
  address: AccountsPayableVoucherLookupAddress;
  addresses: AccountsPayableVoucherLookupAddress[];
  defaultPayableAccount: string;
  termId: string;
  termName: string;
  defaultPurchaseInputVatTaxSourceKey: string;
  defaultPurchaseEwtTaxSourceKey: string;
  defaultPurchaseFwtTaxSourceKey: string;
  defaultPurchaseWvatTaxSourceKey: string;
  contactPerson: string;
  email: string;
  contactNo: string;
};

export type AccountsPayableVoucherLookupTerm = {
  id: string;
  name: string;
  dateMode: "DAY" | "MONTH" | "YEAR";
  period: number;
  status: string;
};

export type AccountsPayableVoucherLookupResponsibilityCenter = {
  id: string;
  code: string;
  name: string;
  typeName: string;
  status: string;
};

export type AccountsPayableVoucherLookupAccount = {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  statementGroup: string;
  statementSection: string;
  normalBalance: "Debit" | "Credit";
  accountCategory: string;
  description: string;
  status: "Active" | "Inactive";
};

export type AccountsPayableVoucherLookupAccountOptions = {
  defaultPayableAccount: AccountsPayableVoucherLookupAccount[];
  employeePayableAccount: AccountsPayableVoucherLookupAccount[];
};

export type AccountsPayableVoucherLookupDefaultAccounts = {
  defaultPayableAccount: string;
  employeePayableAccount: string;
};

export type AccountsPayableVoucherExpenseLine = {
  id: string;
  companyId?: number;
  branchUnitId?: number;
  partyId?: string;
  expenseAccountId?: string;
  lineNumber: number;
  expenseAccountCode: string;
  expenseType: string;
  currencyCode?: string;
  exchangeRate?: number;
  amount: number;
  netAmount: number;
  vat: string;
  vatPercent: number;
  vatAmount: number;
  ewt: string;
  ewtPercent: number;
  ewtAmount: number;
  totalAmountDue: number;
  partyCode: string;
  partyName: string;
  particulars: string;
  responsibilityCenterId?: string;
  responsibilityCenter: string;
  referenceNo: string;
};

export type AccountsPayableVoucherAccountingEntry = {
  id: string;
  referenceType?: string;
  referenceId?: string;
  accountId?: string;
  lineNumber: number;
  accountCode: string;
  accountTitle: string;
  currencyCode?: string;
  exchangeRate?: number;
  particulars: string;
  debit: number;
  credit: number;
  vatType: string;
  atcCode: string;
  partyCode: string;
  partyName: string;
  responsibilityCenterId?: string;
  responsibilityCenter: string;
  refNo: string;
};

export type AccountsPayableVoucherRecord = {
  id: string;
  branchUnitId?: number;
  transactionNo: string;
  documentDate: string;
  partyId?: string;
  partyCode: string;
  partyName: string;
  address: string;
  contactPerson: string;
  contactNo: string;
  projectCode: string;
  projectName: string;
  currency: string;
  exchangeRate: number;
  amount: number;
  termId: string;
  terms: string;
  dueDate: string;
  referenceNo: string;
  creditAccountId?: string;
  creditAccountCode: string;
  creditAccountTitle: string;
  payableType: AccountsPayableVoucherPayableType;
  remarks: string;
  status: AccountsPayableVoucherStatus;
  expenseLines: AccountsPayableVoucherExpenseLine[];
  accountingEntries: AccountsPayableVoucherAccountingEntry[];
  createdAt: string;
  updatedAt: string;
};

export type AccountsPayableVoucherFormValues = Omit<
  AccountsPayableVoucherRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type AccountsPayableVoucherExpenseLineField = keyof AccountsPayableVoucherExpenseLine;

export type AccountsPayableVoucherAccountingEntryField =
  keyof AccountsPayableVoucherAccountingEntry;

export type AccountsPayableVoucherFormErrors = Partial<
  Record<keyof AccountsPayableVoucherFormValues | "balance", string>
> & {
  expenseLineErrors?: Record<
    string,
    Partial<Record<keyof AccountsPayableVoucherExpenseLine, string>>
  >;
  accountingEntryErrors?: Record<
    string,
    Partial<Record<keyof AccountsPayableVoucherAccountingEntry, string>>
  >;
};

export type AccountsPayableVoucherActionMode = "add" | "edit" | "view";

export type AccountsPayableVoucherStatistics = {
  cancelledVouchers: number;
  disapprovedVouchers: number;
  draftVouchers: number;
  forApprovalVouchers: number;
  postedVouchers: number;
  totalVouchers: number;
};

export type AccountsPayableVoucherPermissions = {
  canApprove: boolean;
  canCancel: boolean;
  canClose: boolean;
  canCreate: boolean;
  canDisapprove: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type AccountsPayableVoucherPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AccountsPayableVoucherListData = {
  records: AccountsPayableVoucherRecord[];
  statistics: AccountsPayableVoucherStatistics;
  pagination: AccountsPayableVoucherPagination;
  permissions: AccountsPayableVoucherPermissions;
};

export type AccountsPayableVoucherExpenseColumnId =
  | "expenseType"
  | "amount"
  | "netAmount"
  | "vat"
  | "vatPercent"
  | "vatAmount"
  | "ewt"
  | "ewtPercent"
  | "ewtAmount"
  | "totalAmountDue"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "responsibilityCenter"
  | "referenceNo";

export type AccountsPayableVoucherAccountingColumnId =
  | "accountCode"
  | "accountTitle"
  | "debit"
  | "credit"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "vatType"
  | "atcCode"
  | "responsibilityCenter"
  | "refNo";

export type AccountsPayableVoucherNumberSuggestion = {
  branchUnitId: number;
  inputMode: "AUTO" | "MANUAL" | string;
  transactionNo: string;
};
