export type DisbursementVoucherStatus =
  | "Approved"
  | "Pending Review"
  | "Draft"
  | "Rejected";

export type DisbursementPaymentMethod =
  | "Bank Transfer"
  | "Check"
  | "Online Payment"
  | "Petty Cash";

export type DisbursementType =
  | "Vendor Payment"
  | "Operating Expense"
  | "Reimbursement"
  | "Capital Expenditure";

export type VoucherCurrency = "PHP" | "USD";

export type WorkflowStep = "details" | "entries" | "review";

export type DisbursementVoucherActionMode = "add" | "edit" | "view";

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
};

export type DisbursementLineEntry = {
  id: string;
  accountCode: string;
  accountName: string;
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
  remarks: string;
  voucherReferenceNo: string;
  invoiceReferenceNo: string;
  paymentDueDate: string;
  preparedBy: string;
  lineEntries: DisbursementLineEntry[];
  attachments: DisbursementAttachment[];
  status: DisbursementVoucherStatus;
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
  remarks: string;
  voucherReferenceNo: string;
  invoiceReferenceNo: string;
  paymentDueDate: string;
  preparedBy: string;
  status: DisbursementVoucherStatus;
  lineEntries: DisbursementLineEntry[];
  attachments: DisbursementAttachment[];
};

export type DisbursementVoucherEntryDraft = {
  accountCode: string;
  accountName: string;
  particulars: string;
  debit: string;
  credit: string;
  taxRate: string;
  taxDetails: DisbursementTaxDetails;
};

export type DisbursementVoucherFormErrors = Partial<
  Record<
    | keyof Omit<DisbursementVoucherFormValues, "lineEntries" | "attachments">
    | "lineEntries"
    | "entryDraft",
    string
  >
>;
