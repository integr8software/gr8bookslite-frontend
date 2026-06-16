export type DisbursementVoucherStatus =
  | "Active"
  | "Draft"
  | "Pending"
  | "Approved"
  | "Disapproved"
  | "Cancelled"
  | "Closed";

export type DisbursementPaymentMethod =
  | "Bank Transfer"
  | "Check"
  | "Online Payment"
  | "Petty Cash"
  | (string & {});

export type DisbursementPaymentClassification =
  | "Cash"
  | "With Bank"
  | "Bank Transfer"
  | "Debit";

export type DisbursementType =
  | "Vendor Payment"
  | "Operating Expense"
  | "Reimbursement"
  | "Capital Expenditure"
  | (string & {});

export type VoucherCurrency = "PHP" | "USD" | (string & {});

export type WorkflowStep = "details" | "entries" | "review";

export type DisbursementVoucherActionMode = "add" | "edit" | "view";

export type DisbursementVoucherHistoryEntry = {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
  description: string;
  status: DisbursementVoucherStatus;
};

export type DisbursementVoucherCopySource =
  | "Account Payable Voucher"
  | "Advances to Supplier"
  | "Cash Advance"
  | "Cash Advance Liquidation"
  | "Petty Cash Advance Excess"
  | "Petty Cash Replenishment"
  | "Petty Cash Fund Replenishment"
  | "Purchase Order"
  | "Purchase Journal"
  | "Receiving Report"
  | (string & {});

export type DisbursementVoucherPaymentDetails = {
  bankAccountCode: string;
  bankAccountName: string;
  bankAccountNo: string;
  bankAccountTitle: string;
  bankBranch: string;
  bankName: string;
  checkDate: string;
  checkNo: string;
  checkStatus?: string;
  commission?: string;
  payee?: string;
  paymentReferenceNo: string;
  transferAccountName?: string;
  transferAccountNo?: string;
  transferToBank?: string;
  transferTo?: string;
};

export type DisbursementVoucherBankAccount = {
  id: string;
  accountCode: string;
  accountTitle: string;
  bankName: string;
  branch: string;
  accountName: string;
  accountNo: string;
};

export type DisbursementVoucherPaymentAccount = {
  paymentType: DisbursementPaymentMethod;
  type: DisbursementPaymentClassification;
  status?: "Active" | "Inactive";
  accountCode?: string;
  accountTitle?: string;
  withBank?: boolean;
};

export type DisbursementTransactionRecord = {
  id: string;
  transactionNo: string;
  payee: string;
  purpose: string;
  department: string;
  requestedBy: string;
  transactionDate: string;
  paymentDueDate: string;
  amount: number;
  currency: VoucherCurrency;
  paymentMethod: DisbursementPaymentMethod;
  disbursementType: DisbursementType;
  status: DisbursementVoucherStatus;
  costCenter: string;
  accountingEntries?: DisbursementLineEntry[];
};

export type DisbursementLineEntry = {
  id: string;
  accountCode: string;
  accountName: string;
  partyCode?: string;
  partyName?: string;
  responsibilityCenter?: string;
  refId?: string;
  vatType?: string;
  atcCode?: string;
  particulars: string;
  debit: number;
  credit: number;
  taxRate: string;
  taxDetails: DisbursementTaxDetails;
  status: "Balanced" | "Pending";
};

export type DisbursementTaxDetails = {
  code: string;
  name: string;
  responsibilityCenter: string;
  refId: string;
  vatType: string;
  atcCode: string;
  grossAmount: number;
  netAmount: number;
  vatCode: string;
  vatPercent: number;
  vatAmount: number;
  ewtCode: string;
  ewtPercent: number;
  ewtAmount: number;
  amount: number;
};

export type DisbursementAttachment = {
  id: string;
  name: string;
  sizeLabel: string;
};

export type DisbursementVoucherRecord = {
  id: string;
  transactionId: string;
  voucherNo: string;
  voucherDate: string;
  paymentMethod: DisbursementPaymentMethod;
  disbursementType: DisbursementType;
  currency: VoucherCurrency;
  fxRate: string;
  costCenter: string;
  vceCode: string;
  vceName: string;
  amount: number;
  taxRate: string;
  taxDetails: DisbursementTaxDetails;
  remarks: string;
  referenceModule: string;
  voucherReferenceNo: string;
  invoiceReferenceNo: string;
  paymentDueDate: string;
  paymentDetails: DisbursementVoucherPaymentDetails;
  preparedBy: string;
  lineEntries: DisbursementLineEntry[];
  attachments: DisbursementAttachment[];
  status: DisbursementVoucherStatus;
  history: DisbursementVoucherHistoryEntry[];
};

export type DisbursementVoucherPreviewRow = {
  transaction: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
};

export type DisbursementVoucherFormValues = {
  transactionId: string;
  voucherNo: string;
  voucherDate: string;
  paymentMethod: DisbursementPaymentMethod | "";
  disbursementType: DisbursementType | "";
  currency: VoucherCurrency;
  fxRate: string;
  costCenter: string;
  vceCode: string;
  vceName: string;
  amount: string;
  taxRate: string;
  taxDetails: DisbursementTaxDetails;
  remarks: string;
  referenceModule: string;
  voucherReferenceNo: string;
  invoiceReferenceNo: string;
  paymentDueDate: string;
  paymentDetails: DisbursementVoucherPaymentDetails;
  preparedBy: string;
  status: DisbursementVoucherStatus;
  lineEntries: DisbursementLineEntry[];
  attachments: DisbursementAttachment[];
};

export type DisbursementVoucherEntryDraft = {
  accountCode: string;
  accountName: string;
  partyCode?: string;
  partyName?: string;
  responsibilityCenter?: string;
  refId?: string;
  vatType?: string;
  atcCode?: string;
  particulars: string;
  debit: string;
  credit: string;
  taxRate: string;
  taxDetails: DisbursementTaxDetails;
};

export type DisbursementVoucherAccountingGridSession = {
  entryDraft: DisbursementVoucherEntryDraft;
  mode: "add" | "edit";
  values: DisbursementVoucherFormValues;
};

export type DisbursementVoucherFormErrors = Partial<
  Record<
    | keyof Omit<DisbursementVoucherFormValues, "lineEntries" | "attachments">
    | "lineEntries"
    | "entryDraft",
    string
  >
>;

export type DisbursementVoucherCopyFromRecord = {
  id: string;
  source: DisbursementVoucherCopySource;
  sourceNo: string;
  documentDate: string;
  transactionId: string;
  partyCode: string;
  partyName: string;
  amount: string;
  remarks: string;
  templateValues: DisbursementVoucherFormValues;
};
