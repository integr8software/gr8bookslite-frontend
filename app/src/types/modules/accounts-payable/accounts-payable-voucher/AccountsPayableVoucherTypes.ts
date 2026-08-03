export type AccountsPayableVoucherStatus =
  | "Draft"
  | "Approved"
  | "Disapproved"
  | "Closed"
  | "Cancelled";

export type AccountsPayableVoucherPayableType =
  | "Trade Payable"
  | "Non-Trade Payable"
  | "Employee Payable"
  | "Tax Payable"
  | "Accrued Payable";

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
  status: "ACTIVE";
};

export type AccountsPayableVoucherLookupResponsibilityCenter = {
  id: string;
  code: string;
  name: string;
  typeName: string;
  status: "ACTIVE";
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

export type AccountsPayableVoucherExpenseLineField =
  keyof AccountsPayableVoucherExpenseLine;

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

export type ApiAccountsPayableVoucherStatus =
  | "DRAFT"
  | "APPROVED"
  | "DISAPPROVED"
  | "CLOSED"
  | "CANCELLED"
  | AccountsPayableVoucherStatus;

export type ApiAccountsPayableVoucherPayableType =
  | "TRADE_PAYABLE"
  | "NON_TRADE_PAYABLE"
  | "EMPLOYEE_PAYABLE"
  | "TAX_PAYABLE"
  | "ACCRUED_PAYABLE"
  | AccountsPayableVoucherPayableType;

export type ApiAccountsPayableVoucherDetails = {
  id: string;
  companyId?: number;
  branchUnitId?: number;
  partyId?: string | null;
  expenseAccountId?: string | null;
  lineNumber: number;
  expenseAccountCode: string;
  expenseType: string;
  currencyCode: string;
  exchangeRate: number;
  amount: number;
  netAmount: number;
  vat?: string | null;
  vatPercent: number;
  vatAmount: number;
  ewt?: string | null;
  ewtPercent: number;
  ewtAmount: number;
  totalAmountDue: number;
  partyCode?: string | null;
  partyName?: string | null;
  particulars?: string | null;
  responsibilityCenterId?: string | null;
  responsibilityCenter?: string | null;
  referenceNo?: string | null;
};

export type ApiJournalEntry = {
  id: string;
  referenceType?: string | null;
  referenceId?: string | null;
  accountId?: string | null;
  lineNumber: number;
  accountCode: string;
  accountTitle: string;
  currencyCode: string;
  exchangeRate: number;
  particulars?: string | null;
  debit: number;
  credit: number;
  vatType?: string | null;
  atcCode?: string | null;
  partyCode?: string | null;
  partyName?: string | null;
  responsibilityCenterId?: string | null;
  responsibilityCenter?: string | null;
  refNo?: string | null;
};

export type ApiAccountsPayableVoucher = {
  id: string;
  branchUnitId?: number;
  transactionNo: string;
  documentDate: string;
  partyId?: string | null;
  partyCode: string;
  partyName: string;
  address?: string | null;
  contactPerson?: string | null;
  contactNo?: string | null;
  projectName?: string | null;
  currency: string;
  exchangeRate: number;
  amount: number;
  termId?: string | null;
  terms?: string | null;
  dueDate: string;
  referenceNo?: string | null;
  creditAccountId?: string | null;
  creditAccountCode: string;
  creditAccountTitle: string;
  payableType: ApiAccountsPayableVoucherPayableType;
  remarks?: string | null;
  status: ApiAccountsPayableVoucherStatus;
  details: ApiAccountsPayableVoucherDetails[];
  journalEntries: ApiJournalEntry[];
  createdAt: string;
  updatedAt: string;
};

export type AccountsPayableVoucherStatistics = {
  approvedVouchers: number;
  cancelledVouchers: number;
  closedVouchers: number;
  disapprovedVouchers: number;
  draftVouchers: number;
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

export type ApiAccountsPayableVoucherListResponse = {
  vouchers: ApiAccountsPayableVoucher[];
  statistics: AccountsPayableVoucherStatistics;
  pagination: AccountsPayableVoucherPagination;
  permissions: AccountsPayableVoucherPermissions;
};

export type ApiAccountsPayableVoucherSaveResponse = {
  message?: string;
  voucher: ApiAccountsPayableVoucher;
  permissions?: AccountsPayableVoucherPermissions;
};

export type ApiAccountsPayableVoucherDetailResponse = {
  voucher: ApiAccountsPayableVoucher;
  permissions: AccountsPayableVoucherPermissions;
};

export type AccountsPayableVoucherListResponse = {
  records: AccountsPayableVoucherRecord[];
  statistics: AccountsPayableVoucherStatistics;
  pagination: AccountsPayableVoucherPagination;
  permissions: AccountsPayableVoucherPermissions;
};

export type AccountsPayableVoucherNumberSuggestion = {
  branchUnitId: number;
  inputMode: "AUTO" | "MANUAL" | string;
  transactionNo: string;
};
