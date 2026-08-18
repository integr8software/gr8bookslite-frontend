import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { PaymentTypeRecord as AppPaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { useDisbursementVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucherActionPage";

export type DisbursementVoucherStatus = "Open" | "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled" | "Closed";

export type DisbursementVoucherDisplayStatus = DisbursementVoucherStatus;

export type DisbursementVoucherTableColumnKey =
  | "voucherNo"
  | "documentDate"
  | "partyCode"
  | "partyName"
  | "paymentType"
  | "remarks"
  | "currency"
  | "amount"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type DisbursementPaymentMethod = "Bank Transfer" | "Check" | "E-Wallet" | "InstaPay" | "Manager's Check" | "PESONet" | (string & {});

export type DisbursementPaymentClassification = "Cash" | "Bank Transfer" | "Check" | "Digital Wallet" | "Non-Cash Settlement";

export type DisbursementType = "Vendor Payment" | "Operating Expense" | "Reimbursement" | "Capital Expenditure" | (string & {});

export type VoucherCurrency = "PHP" | "USD" | (string & {});

export type WorkflowStep = "details" | "entries" | "review";

export type DisbursementVoucherActionMode = "add" | "edit" | "view";

export type DisbursementVoucherActionPageState = ReturnType<typeof useDisbursementVoucherActionPage>;

export type DisbursementVoucherActionTab = "details" | "bank-information" | "attachments";

export type DisbursementVoucherStatusFilter = "all" | Exclude<DisbursementVoucherStatus, "Open">;

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
  | "Advances to Suppliers"
  | "Cash Advance"
  | "Cash Advance Multiple Entry"
  | "Revolving Fund"
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
  isMultiCheckNumber?: boolean;
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
  projectName?: string;
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
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
};

export type DisbursementLineEntry = {
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

export type DisbursementAttachment = TransactionAttachment;

export type DisbursementVoucherFileAttachmentFieldsProps = {
  attachments: DisbursementAttachment[];
  isReadonly: boolean;
  inputName?: string;
  uploadTitle?: string;
  onAttachmentsChange: (attachments: DisbursementAttachment[]) => void;
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
  projectName?: string;
  partyCode: string;
  partyName: string;
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
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
};

export type DisbursementVoucherPreviewRow = {
  transaction: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
};

export type DisbursementVoucherStoreState = {
  previewRows: DisbursementVoucherPreviewRow[];
  transactions: DisbursementTransactionRecord[];
  vouchers: DisbursementVoucherRecord[];
  addTransaction: (transaction: DisbursementTransactionRecord) => void;
  updateTransaction: (transaction: DisbursementTransactionRecord) => void;
  addVoucher: (voucher: DisbursementVoucherRecord) => void;
  updateVoucher: (voucher: DisbursementVoucherRecord) => void;
  deleteVoucher: (voucherId: string) => void;
  isLoading: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
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
  projectName: string;
  partyCode: string;
  partyName: string;
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
  Record<keyof Omit<DisbursementVoucherFormValues, "lineEntries" | "attachments"> | "lineEntries" | "entryDraft", string>
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

export type DisbursementVoucherFieldUpdater<TValues> = <TKey extends keyof TValues>(field: TKey, value: TValues[TKey]) => void;

export type DisbursementVoucherActionHeaderProps = {
  copyFromRecords?: AppCopyFromRecord[];
  copyFromSources?: string[];
  mode: DisbursementVoucherActionMode;
  returnHref?: string;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
  onCopyFrom?: (recordIds: string[]) => void;
  onPreview?: () => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
};

export type DisbursementVoucherDetailsFormProps = {
  canAddPartyName: boolean;
  canAddPaymentType: boolean;
  canAddProjectName: boolean;
  errors: DisbursementVoucherFormErrors;
  currencyOptions: AppAdvancedDropdownOption[];
  isExchangeRateLoading: boolean;
  isReadonly: boolean;
  paymentTypeRecords: AppPaymentTypeRecord[];
  values: DisbursementVoucherFormValues;
  onOpenPartyNameDrawer: () => void;
  onOpenPaymentTypeDrawer: () => void;
  onOpenProjectNameDrawer: () => void;
  onPartyChange: (partyCode: string, partyName: string) => void;
  onCurrencyChange: (currencyCode: string) => void;
  onPaymentTypeChange: (paymentMethod: string) => void;
  onUpdateField: DisbursementVoucherFieldUpdater<DisbursementVoucherFormValues>;
};

export type DisbursementVoucherPaymentFieldsProps = {
  bankAccounts: DisbursementVoucherBankAccount[];
  canAddBankAccount: boolean;
  isMultiCheckNumber: boolean;
  isReadonly: boolean;
  paymentType: string;
  paymentTypeRecord: AppPaymentTypeRecord | null;
  values: DisbursementVoucherFormValues;
  onOpenBankAccountDrawer: () => void;
  onUpdateBankAccount: (accountCode: string) => void;
  onUpdatePaymentDetails: (nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>) => void;
};

export type DisbursementVoucherBankInformationFieldsProps = DisbursementVoucherPaymentFieldsProps & {
  paymentTypeRecords: AppPaymentTypeRecord[];
};

export type DisbursementVoucherReportPreviewProps = {
  isOpen: boolean;
  values: DisbursementVoucherFormValues;
  onClose: () => void;
  onGeneratePdf: () => void;
};

export type DisbursementVoucherPdfText = string | Array<string | { text: string; bold?: boolean }>;
