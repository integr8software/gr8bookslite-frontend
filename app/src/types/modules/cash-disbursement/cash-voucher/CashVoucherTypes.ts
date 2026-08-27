import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import type { VoucherReportPreviewFormat } from "@/app/src/types/shared/reports/ReportTypes";
import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { useCashVoucherPreviewTable } from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucher";
import type { useCashVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucherActionPage";

export type CashVoucherStatus = "Open" | "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled" | "Closed";

export type CashVoucherDisplayStatus = CashVoucherStatus;
export type CashVoucherPreviewTableState = ReturnType<typeof useCashVoucherPreviewTable>;

export type CashVoucherTableColumnKey =
  | "voucherNo"
  | "documentDate"
  | "partyCode"
  | "partyName"
  | "remarks"
  | "currency"
  | "amount"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type CashVoucherPaymentMethod = "Cash";

export type CashVoucherPaymentClassification = "Cash";

export type CashVoucherType = "Vendor Payment" | "Operating Expense" | "Reimbursement" | "Capital Expenditure" | (string & {});

export type VoucherCurrency = "PHP" | "USD" | (string & {});

export type WorkflowStep = "details" | "entries" | "review";

export type CashVoucherActionMode = "add" | "edit" | "view";

export type CashVoucherActionPageState = ReturnType<typeof useCashVoucherActionPage>;

export type CashVoucherActionTab = "details" | "attachments";

export type CashVoucherStatusFilter = "all" | Exclude<CashVoucherStatus, "Open">;

export type CashVoucherHistoryEntry = {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
  description: string;
  status: CashVoucherStatus;
};

export type CashVoucherCopySource =
  | "Accounts Payable Voucher"
  | "Advances to Suppliers"
  | "Cash Advance"
  | "Cash Advance Liquidation"
  | "Cash Advance Multiple Entry"
  | "Cash Advance Multiple Entry Liquidation"
  | "Petty Cash Fund"
  | "Petty Cash Fund Replenishment"
  | "Revolving Fund"
  | "Revolving Fund Replenishment"
  | "Revolving Fund Return"
  | "Purchase Order"
  | "Purchase Journal"
  | "Receiving Report"
  | (string & {});

export type CashVoucherPaymentDetails = {
  bankAccountCode: string;
  bankAccountName: string;
  bankAccountNo: string;
  bankAccountTitle: string;
  bankBranch: string;
  bankName: string;
  checkDate: string;
  checkNo: string;
  checkStatus?: string;
  isMultiCheckNumber?: boolean;
  payee?: string;
  paymentReferenceNo: string;
  transferAccountName?: string;
  transferAccountNo?: string;
  transferToBank?: string;
  transferTo?: string;
};

export type CashVoucherBankAccount = {
  id: string;
  accountCode: string;
  accountTitle: string;
  bankName: string;
  branch: string;
  accountName: string;
  accountNo: string;
};

export type CashVoucherPaymentAccount = {
  paymentType: CashVoucherPaymentMethod;
  type: CashVoucherPaymentClassification;
  status?: "Active" | "Inactive";
  accountCode?: string;
  accountTitle?: string;
  withBank?: boolean;
};

export type CashVoucherTransactionRecord = {
  id: string;
  transactionNo: string;
  payee: string;
  purpose: string;
  department: string;
  projectName?: string;
  requestedBy: string;
  transactionDate: string;
  paymentDueDate: string;
  amount: number;
  currency: VoucherCurrency;
  paymentMethod: CashVoucherPaymentMethod;
  disbursementType: CashVoucherType;
  status: CashVoucherStatus;
  costCenter: string;
  accountingEntries?: CashVoucherLineEntry[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
};

export type CashVoucherLineEntry = {
  id: string;
  accountCode: string;
  accountName: string;
  checkDate?: string;
  checkNo?: string;
  checkStatus?: string;
  partyCode?: string;
  partyName?: string;
  responsibilityCenter?: string;
  refId?: string;
  vatType?: string;
  ewtCode?: string;
  remarks: string;
  debit: number;
  credit: number;
  taxRate: string;
  taxDetails: CashVoucherTaxDetails;
  status: "Balanced" | "Pending";
};

export type CashVoucherTaxDetails = {
  code: string;
  name: string;
  responsibilityCenter: string;
  refId: string;
  vatType: string;
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

export type CashVoucherAttachment = TransactionAttachment;

export type CashVoucherFileAttachmentFieldsProps = {
  attachments: CashVoucherAttachment[];
  isReadonly: boolean;
  inputName?: string;
  uploadTitle?: string;
  onAttachmentsChange: (attachments: CashVoucherAttachment[]) => void;
};

export type CashVoucherRecord = {
  id: string;
  transactionId: string;
  voucherNo: string;
  voucherDate: string;
  paymentMethod: CashVoucherPaymentMethod;
  disbursementType: CashVoucherType;
  currency: VoucherCurrency;
  fxRate: string;
  costCenter: string;
  projectName?: string;
  partyCode: string;
  partyName: string;
  amount: number;
  taxRate: string;
  taxDetails: CashVoucherTaxDetails;
  remarks: string;
  referenceModule: string;
  voucherReferenceNo: string;
  invoiceReferenceNo: string;
  paymentDueDate: string;
  paymentDetails: CashVoucherPaymentDetails;
  preparedBy: string;
  lineEntries: CashVoucherLineEntry[];
  attachments: CashVoucherAttachment[];
  status: CashVoucherStatus;
  history: CashVoucherHistoryEntry[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
};

export type CashVoucherPreviewRow = {
  transaction: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
};

export type CashVoucherStoreState = {
  previewRows: CashVoucherPreviewRow[];
  transactions: CashVoucherTransactionRecord[];
  vouchers: CashVoucherRecord[];
  addTransaction: (transaction: CashVoucherTransactionRecord) => void;
  updateTransaction: (transaction: CashVoucherTransactionRecord) => void;
  addVoucher: (voucher: CashVoucherRecord) => void;
  updateVoucher: (voucher: CashVoucherRecord) => void;
  deleteVoucher: (voucherId: string) => void;
  isLoading: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
  refreshRecords: () => void;
};

export type CashVoucherFormValues = {
  transactionId: string;
  voucherNo: string;
  voucherDate: string;
  paymentMethod: CashVoucherPaymentMethod | "";
  disbursementType: CashVoucherType | "";
  currency: VoucherCurrency;
  fxRate: string;
  costCenter: string;
  projectName: string;
  partyCode: string;
  partyName: string;
  amount: string;
  taxRate: string;
  taxDetails: CashVoucherTaxDetails;
  remarks: string;
  referenceModule: string;
  voucherReferenceNo: string;
  invoiceReferenceNo: string;
  paymentDueDate: string;
  paymentDetails: CashVoucherPaymentDetails;
  preparedBy: string;
  status: CashVoucherStatus;
  lineEntries: CashVoucherLineEntry[];
  attachments: CashVoucherAttachment[];
};

export type CashVoucherEntryDraft = {
  accountCode: string;
  accountName: string;
  partyCode?: string;
  partyName?: string;
  responsibilityCenter?: string;
  refId?: string;
  vatType?: string;
  ewtCode?: string;
  remarks: string;
  debit: string;
  credit: string;
  taxRate: string;
  taxDetails: CashVoucherTaxDetails;
};

export type CashVoucherAccountingGridSession = {
  entryDraft: CashVoucherEntryDraft;
  mode: "add" | "edit";
  values: CashVoucherFormValues;
};

export type CashVoucherFormErrors = Partial<
  Record<keyof Omit<CashVoucherFormValues, "lineEntries" | "attachments"> | "lineEntries" | "entryDraft", string>
>;

export type CashVoucherCopyFromRecord = {
  id: string;
  source: CashVoucherCopySource;
  sourceNo: string;
  documentDate: string;
  transactionId: string;
  partyCode: string;
  partyName: string;
  amount: string;
  remarks: string;
  templateValues: CashVoucherFormValues;
};

export type CashVoucherFieldUpdater<TValues> = <TKey extends keyof TValues>(field: TKey, value: TValues[TKey]) => void;

export type CashVoucherActionHeaderProps = {
  copyFromRecords?: AppCopyFromRecord[];
  copyFromSources?: string[];
  hasDiscardableChanges: boolean;
  mode: CashVoucherActionMode;
  isSubmitting?: boolean;
  returnLink?: string;
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
  pendingSubmitStatus: CashVoucherStatus | null;
  onBack?: () => void;
  onDiscard?: () => void;
  onCancelSubmit: () => void;
  onConfirmSubmit: () => void;
  onCopyFrom?: (recordIds: string[]) => void;
  onPreview?: (format: VoucherReportPreviewFormat) => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  onUpdateStatus?: (status: CashVoucherStatus) => void;
};

export type CashVoucherDetailsFormProps = {
  canAddPartyName: boolean;
  canAddProjectName: boolean;
  errors: CashVoucherFormErrors;
  currencyOptions: AppAdvancedDropdownOption[];
  isExchangeRateLoading: boolean;
  isReadonly: boolean;
  values: CashVoucherFormValues;
  onOpenPartyNameDrawer: () => void;
  onOpenProjectNameDrawer: () => void;
  onPartyChange: (partyCode: string, partyName: string) => void;
  onCurrencyChange: (currencyCode: string) => void;
  onUpdateField: CashVoucherFieldUpdater<CashVoucherFormValues>;
};

export type CashVoucherReportPreviewProps = {
  isOpen: boolean;
  values: CashVoucherFormValues;
  onClose: () => void;
  onGeneratePdf: () => void;
};

export type CashVoucherPdfText = string | Array<string | { text: string; bold?: boolean }>;


