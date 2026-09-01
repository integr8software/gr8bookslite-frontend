import type {
  DisbursementAttachment,
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherBankAccount,
  DisbursementVoucherDisplayStatus,
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormValues,
  DisbursementVoucherHistoryEntry,
  DisbursementVoucherPaymentAccount,
  DisbursementVoucherPaymentDetails,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { DisbursementVoucherStatuses } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { formatCurrency as formatCurrencyValue } from "@/app/src/utils/currency.util";

const CashInHandAccount = {
  accountCode: "1001111",
  accountName: "Cash in Hand",
} as const;

const InputVatAccount = {
  accountCode: "2010002011",
  accountName: "Input VAT",
} as const;

const ExpandedWithholdingTaxAccount = {
  accountCode: "2010002002",
  accountName: "Expanded Withholding Tax",
} as const;

export function createDisbursementVoucherPaymentTypeRecords(paymentTypes: PaymentTypeRecord[]) {
  return paymentTypes;
}

export const DisbursementVoucherInitialEntryDraft: DisbursementVoucherEntryDraft = {
  accountCode: "",
  accountName: "",
  ewtCode: "",
  remarks: "",
  partyCode: "",
  partyName: "",
  refId: "",
  responsibilityCenter: "",
  debit: "",
  credit: "",
  taxRate: "0%",
  taxDetails: createTaxDetails(0, "0%"),
  vatType: "",
};

export function createBlankDisbursementLineEntry(overrides: Partial<DisbursementLineEntry> = {}): DisbursementLineEntry {
  const refId = overrides.refId ?? "";
  const responsibilityCenter = overrides.responsibilityCenter ?? "";
  const particulars = overrides.particulars ?? overrides.remarks ?? "";

  return {
    accountCode: "",
    accountName: "",
    checkDate: "",
    checkNo: "",
    checkStatus: "",
    credit: 0,
    debit: 0,
    ewtCode: "",
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    particulars,
    partyCode: "",
    partyName: "",
    refId,
    remarks: particulars,
    responsibilityCenter,
    status: "Pending",
    taxDetails: {
      ...createTaxDetails(0, "0%"),
      refId,
      responsibilityCenter,
    },
    taxRate: "0%",
    vatType: "",
    ...overrides,
  };
}

export function ensureDisbursementLineEntries(entries: DisbursementLineEntry[]) {
  return entries.length > 0 ? entries : [createBlankDisbursementLineEntry()];
}

export function sanitizeDisbursementVoucherRecord(voucher: DisbursementVoucherRecord): DisbursementVoucherRecord {
  const createdAt = voucher.createdAt ?? voucher.history?.[0]?.createdAt ?? "";
  const updatedAt = voucher.updatedAt ?? voucher.history?.[voucher.history.length - 1]?.createdAt ?? createdAt;
  const lineEntries = normalizeGeneratedDisbursementRemarks(voucher.lineEntries ?? []);

  return {
    ...voucher,
    attachments: voucher.attachments ?? [],
    createdAt,
    createdBy: voucher.createdBy ?? voucher.preparedBy ?? "",
    history:
      voucher.history?.length > 0
        ? voucher.history.map(normalizeDisbursementVoucherHistoryEntry)
        : createInitialDisbursementVoucherHistory(voucher),
    lineEntries,
    paymentDetails: normalizePaymentDetails(voucher.paymentDetails ?? createEmptyPaymentDetails()),
    referenceModule: voucher.referenceModule ?? "",
    status: getDisbursementVoucherDisplayStatus(voucher.status),
    updatedAt,
    updatedBy: voucher.updatedBy ?? voucher.preparedBy ?? "",
  };
}

export function createDisbursementVoucherFormValues(
  transaction?: DisbursementTransactionRecord,
  voucher?: DisbursementVoucherRecord,
): DisbursementVoucherFormValues {
  if (voucher) {
    return {
      transactionId: voucher.transactionId,
      voucherNo: voucher.voucherNo,
      voucherDate: voucher.voucherDate,
      paymentMethod: voucher.paymentMethod,
      disbursementType: voucher.disbursementType,
      currency: voucher.currency,
      fxRate: voucher.fxRate,
      costCenter: voucher.costCenter,
      projectName: voucher.projectName ?? transaction?.projectName ?? transaction?.department ?? "",
      partyCode: voucher.partyCode,
      partyName: voucher.partyName,
      amount: voucher.amount.toFixed(2),
      taxRate: voucher.taxRate,
      taxDetails: voucher.taxDetails,
      remarks: voucher.remarks,
      referenceModule: voucher.referenceModule ?? "",
      voucherReferenceNo: voucher.voucherReferenceNo,
      invoiceReferenceNo: voucher.invoiceReferenceNo,
      paymentDueDate: voucher.paymentDueDate,
      paymentDetails: normalizePaymentDetails(voucher.paymentDetails),
      preparedBy: voucher.preparedBy,
      status: voucher.status,
      lineEntries: ensureDisbursementLineEntries(voucher.lineEntries),
      attachments: voucher.attachments ?? [],
    };
  }

  return {
    amount: transaction ? createDefaultTransactionTaxDetails(transaction).amount.toFixed(2) : "",
    attachments: [],
    costCenter: transaction?.costCenter ?? "",
    currency: transaction?.currency ?? "PHP",
    disbursementType: transaction?.disbursementType ?? "",
    fxRate: "1.00",
    invoiceReferenceNo: "",
    lineEntries: transaction
      ? ensureDisbursementLineEntries(createAutoDisbursementLineEntries(transaction))
      : [createBlankDisbursementLineEntry()],
    partyCode: "",
    partyName: transaction?.payee ?? "",
    paymentDetails: createEmptyPaymentDetails(),
    paymentDueDate: transaction?.paymentDueDate ?? todayDateValue(),
    paymentMethod: transaction?.paymentMethod ?? "",
    preparedBy: "",
    projectName: transaction?.projectName ?? transaction?.department ?? "",
    referenceModule: "Disbursement Voucher",
    remarks: transaction?.purpose ?? "",
    status: DisbursementVoucherStatuses.open,
    taxDetails: transaction ? createDefaultTransactionTaxDetails(transaction) : createTaxDetails(0, "0%"),
    taxRate: transaction ? getDefaultTaxRate(transaction) : "0%",
    transactionId: transaction?.id ?? "",
    voucherDate: todayDateValue(),
    voucherNo: "",
    voucherReferenceNo: "",
  };
}

export function createDisbursementLineEntry(draft: DisbursementVoucherEntryDraft): DisbursementLineEntry {
  const amount = parseMoneyNumberInput(draft.debit) || parseMoneyNumberInput(draft.credit);
  const taxDetails = syncTaxDetailsAmount(
    {
      ...createTaxDetails(amount, draft.taxRate),
      ...draft.taxDetails,
    },
    amount,
    draft.taxRate,
  );

  return {
    accountCode: draft.accountCode.trim(),
    accountName: draft.accountName.trim(),
    ewtCode: taxDetails.ewtCode,
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    particulars: (draft.particulars ?? draft.remarks ?? "").trim(),
    remarks: draft.remarks?.trim() ?? "",
    partyCode: draft.partyCode?.trim() ?? "",
    partyName: draft.partyName?.trim() ?? "",
    refId: taxDetails.refId,
    responsibilityCenter: taxDetails.responsibilityCenter,
    debit: parseMoneyNumberInput(draft.debit),
    credit: parseMoneyNumberInput(draft.credit),
    taxRate: draft.taxRate,
    taxDetails,
    vatType: taxDetails.vatType,
    status: "Balanced",
  };
}

export function createAutoDisbursementLineEntries(
  transaction: DisbursementTransactionRecord,
  bankAccount?: DisbursementVoucherBankAccount | null,
): DisbursementLineEntry[] {
  const debitAccount = getDebitAccountTemplate(transaction);
  const creditAccount = getCreditAccountTemplate(transaction, bankAccount);
  const taxProfile = getDefaultTaxProfile(transaction);
  const taxDetails = createDisbursementTaxDetails({ amount: transaction.amount, ...taxProfile });
  const refId = transaction.transactionNo || transaction.id;
  const generatedRemarks = createAutoDisbursementGeneratedRemarks(
    transaction.purpose,
    debitAccount.accountName,
    transaction.paymentMethod,
  );
  const commonFields = {
    partyCode: "",
    partyName: transaction.payee,
    refId,
    responsibilityCenter: transaction.costCenter,
  };
  const entries: DisbursementLineEntry[] = [
    {
      id: `auto-expense-${transaction.id}`,
      accountCode: debitAccount.accountCode,
      accountName: debitAccount.accountName,
      ewtCode: "",
      particulars: transaction.purpose || debitAccount.accountName,
      remarks: transaction.purpose || debitAccount.accountName,
      ...commonFields,
      debit: taxDetails.netAmount,
      credit: 0,
      taxRate: taxProfile.vatPercent > 0 ? `${taxProfile.vatPercent}%` : "0%",
      taxDetails: { ...taxDetails, ...commonFields },
      vatType: taxProfile.vatCode,
      status: "Balanced",
    },
  ];

  if (taxDetails.vatAmount > 0) {
    entries.push({
      id: `auto-input-vat-${transaction.id}`,
      accountCode: InputVatAccount.accountCode,
      accountName: InputVatAccount.accountName,
      ewtCode: "",
      particulars: generatedRemarks.inputVat,
      remarks: generatedRemarks.inputVat,
      ...commonFields,
      debit: taxDetails.vatAmount,
      credit: 0,
      taxRate: "0%",
      taxDetails: { ...createTaxDetails(taxDetails.vatAmount, "0%"), ...commonFields },
      vatType: "Input VAT",
      status: "Balanced",
    });
  }

  if (taxDetails.ewtAmount > 0) {
    entries.push({
      id: `auto-ewt-${transaction.id}`,
      accountCode: ExpandedWithholdingTaxAccount.accountCode,
      accountName: ExpandedWithholdingTaxAccount.accountName,
      ewtCode: taxDetails.ewtCode,
      particulars: generatedRemarks.ewt,
      remarks: generatedRemarks.ewt,
      ...commonFields,
      debit: 0,
      credit: taxDetails.ewtAmount,
      taxRate: "0%",
      taxDetails: { ...createTaxDetails(taxDetails.ewtAmount, "0%"), ...commonFields },
      vatType: "EWT",
      status: "Balanced",
    });
  }

  entries.push({
    id: `auto-credit-${transaction.id}`,
    accountCode: creditAccount.accountCode,
    accountName: creditAccount.accountName,
    ewtCode: "",
    particulars: generatedRemarks.settlement,
    remarks: generatedRemarks.settlement,
    ...commonFields,
    debit: 0,
    credit: taxDetails.amount,
    taxRate: "0%",
    taxDetails: { ...createTaxDetails(taxDetails.amount, "0%"), ...commonFields },
    vatType: "",
    status: "Balanced",
  });

  return entries;
}

export function applyBankAccountToPaymentDetails(
  paymentDetails: DisbursementVoucherPaymentDetails,
  bankAccount: DisbursementVoucherBankAccount | null,
): DisbursementVoucherPaymentDetails {
  if (!bankAccount) {
    return {
      ...paymentDetails,
      bankAccountCode: "",
      bankAccountTitle: "",
    };
  }

  return {
    ...paymentDetails,
    bankAccountCode: bankAccount.accountCode,
    bankAccountName: bankAccount.accountName,
    bankAccountNo: bankAccount.accountNo,
    bankAccountTitle: bankAccount.accountTitle,
    bankBranch: bankAccount.branch,
    bankName: bankAccount.bankName,
  };
}

export function applyBankAccountToDisbursementLineEntries(
  entries: DisbursementLineEntry[],
  bankAccount: DisbursementVoucherBankAccount | null,
  paymentAccount?: DisbursementVoucherPaymentAccount | null,
) {
  if (!bankAccount) {
    return entries;
  }

  return entries.map((entry) =>
    isBankReplaceableCreditEntry(entry)
      ? {
          ...entry,
          accountCode: bankAccount.accountCode,
          accountName: bankAccount.accountTitle,
          remarks: createCreditRemarks(undefined, bankAccount, paymentAccount),
        }
      : entry,
  );
}

export function createTaxDetails(amount: number, taxRate: string): DisbursementTaxDetails {
  const roundedAmount = roundCurrency(amount);
  const sign = roundedAmount < 0 ? -1 : 1;
  const absoluteAmount = Math.abs(roundedAmount);
  const vatPercent = parseTaxPercent(taxRate);
  const vatAmount = roundCurrency(sign * ((absoluteAmount * vatPercent) / 100));
  const ewtAmount = 0;
  const netAmount = roundCurrency(sign * Math.max(absoluteAmount - Math.abs(vatAmount), 0));
  const totalPayable = roundCurrency(sign * Math.max(absoluteAmount - Math.abs(ewtAmount), 0));

  return {
    code: "",
    name: "",
    responsibilityCenter: "",
    refId: "",
    vatType: "",
    grossAmount: roundedAmount,
    netAmount,
    vatCode: taxRate !== "0%" ? `VAT-${taxRate.replace("%", "")}` : "",
    vatPercent,
    vatAmount,
    ewtCode: "",
    ewtPercent: 0,
    ewtAmount,
    amount: totalPayable,
  };
}

export function syncTaxDetailsAmount(currentTaxDetails: DisbursementTaxDetails | undefined, amount: number, taxRate: string) {
  const roundedAmount = roundCurrency(amount);
  const sign = roundedAmount < 0 ? -1 : 1;
  const absoluteAmount = Math.abs(roundedAmount);
  const baseTaxDetails = currentTaxDetails ?? createTaxDetails(amount, taxRate);
  const vatPercent = baseTaxDetails.vatCode || baseTaxDetails.vatPercent > 0 ? baseTaxDetails.vatPercent : parseTaxPercent(taxRate);
  const vatAmount = roundCurrency(sign * ((absoluteAmount * vatPercent) / 100));
  const ewtAmount = roundCurrency(sign * ((absoluteAmount * baseTaxDetails.ewtPercent) / 100));
  const netAmount = roundCurrency(sign * Math.max(absoluteAmount - Math.abs(vatAmount), 0));
  const totalPayable = roundCurrency(sign * Math.max(absoluteAmount - Math.abs(ewtAmount), 0));

  return {
    ...baseTaxDetails,
    grossAmount: roundedAmount,
    netAmount,
    vatPercent,
    vatAmount,
    ewtAmount,
    amount: totalPayable,
  };
}

export function formatTaxRateSummary(taxDetails: DisbursementTaxDetails) {
  const vatLabel = taxDetails.vatPercent > 0 ? `VAT ${taxDetails.vatPercent}%` : "";
  const ewtLabel = taxDetails.ewtPercent > 0 ? ` / EWT ${taxDetails.ewtPercent}%` : "";

  return `${vatLabel}${ewtLabel}`;
}

export function createAttachmentPlaceholders(): DisbursementAttachment[] {
  return [];
}

export function formatCurrency(amount: number) {
  return formatCurrencyValue(amount);
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getDisbursementVoucherDisplayStatus(status: string): DisbursementVoucherDisplayStatus {
  if (status === DisbursementVoucherStatuses.draft || status === DisbursementVoucherStatuses.open) {
    return DisbursementVoucherStatuses.draft;
  }

  if (status === "Pending Review" || status === "Pending" || status === "Active") {
    return DisbursementVoucherStatuses.forApproval;
  }

  if (status === "Rejected") {
    return DisbursementVoucherStatuses.disapproved;
  }

  if (status === "Completed") {
    return DisbursementVoucherStatuses.closed;
  }

  if (status === "Approved") {
    return DisbursementVoucherStatuses.posted;
  }

  if (
    status === DisbursementVoucherStatuses.draft ||
    status === DisbursementVoucherStatuses.forApproval ||
    status === DisbursementVoucherStatuses.posted ||
    status === DisbursementVoucherStatuses.disapproved ||
    status === DisbursementVoucherStatuses.cancelled ||
    status === DisbursementVoucherStatuses.closed
  ) {
    return status;
  }

  return DisbursementVoucherStatuses.draft;
}

function createEmptyPaymentDetails(): DisbursementVoucherPaymentDetails {
  return {
    bankAccountCode: "",
    bankAccountName: "",
    bankAccountNo: "",
    bankAccountTitle: "",
    bankBranch: "",
    bankName: "",
    checkDate: "",
    checkNo: "",
    checkStatus: "",
    isMultiCheckNumber: false,
    payee: "",
    paymentReferenceNo: "",
    transferAccountName: "",
    transferAccountNo: "",
    transferToBank: "",
    transferTo: "",
  };
}

function normalizePaymentDetails(paymentDetails: DisbursementVoucherPaymentDetails): DisbursementVoucherPaymentDetails {
  return {
    ...createEmptyPaymentDetails(),
    ...paymentDetails,
  };
}

function normalizeGeneratedDisbursementRemarks(entries: DisbursementLineEntry[]) {
  const sourceEntry = entries.find((entry) => !isGeneratedDisbursementLineEntry(entry));
  const sourceRemarks = (sourceEntry?.particulars || sourceEntry?.remarks || "").trim();
  const sourceCreatedRemarks = sourceEntry?.accountName.trim() ?? "";
  const hasUserRemarks = sourceRemarks !== "" && sourceRemarks !== sourceCreatedRemarks;

  if (!hasUserRemarks) {
    return entries;
  }

  return entries.map((entry) => {
    const entryRemarks = entry.particulars || entry.remarks || "";
    if (!isGeneratedDisbursementLineEntry(entry) || !hasGeneratedDisbursementRemarkPrefix(entryRemarks)) {
      return entry;
    }

    const nextRemarks = stripGeneratedDisbursementRemarkPrefix(entryRemarks, sourceRemarks);
    return {
      ...entry,
      particulars: nextRemarks,
      remarks: nextRemarks,
    };
  });
}

function isGeneratedDisbursementLineEntry(entry: DisbursementLineEntry) {
  const accountName = entry.accountName.trim().toLowerCase();

  return (
    entry.id.startsWith("auto-input-vat-") ||
    entry.id.startsWith("auto-ewt-") ||
    entry.id.startsWith("auto-credit-") ||
    accountName === "input vat" ||
    accountName === "expanded withholding tax" ||
    accountName.startsWith("cash in bank")
  );
}

function hasGeneratedDisbursementRemarkPrefix(remarks: string) {
  const trimmedRemarks = remarks.trim();

  return getGeneratedDisbursementRemarkPrefixPatterns().some((pattern) => pattern.test(trimmedRemarks));
}

function stripGeneratedDisbursementRemarkPrefix(remarks: string, fallbackRemarks: string) {
  const trimmedRemarks = remarks.trim();

  for (const pattern of getGeneratedDisbursementRemarkPrefixPatterns()) {
    if (pattern.test(trimmedRemarks)) {
      return trimmedRemarks.replace(pattern, "").trim() || fallbackRemarks;
    }
  }

  return trimmedRemarks || fallbackRemarks;
}

function getGeneratedDisbursementRemarkPrefixPatterns() {
  return [/^Input VAT\s*-\s*/i, /^EWT\s*-\s*/i, /^Expanded Withholding Tax\s*-\s*/i, /^Settlement via .*?\s*-\s*/i];
}

function createInitialDisbursementVoucherHistory(
  voucher: Pick<DisbursementVoucherRecord, "voucherNo" | "voucherDate" | "status">,
): DisbursementVoucherHistoryEntry[] {
  const createdStatus =
    voucher.status === DisbursementVoucherStatuses.draft ? DisbursementVoucherStatuses.draft : DisbursementVoucherStatuses.forApproval;
  const createdAt = createDisbursementVoucherHistoryDate(voucher.voucherDate, 8);
  const history: DisbursementVoucherHistoryEntry[] = [
    {
      id: `dv-history-${voucher.voucherNo}-created`,
      action: "Created",
      actor: "System",
      createdAt,
      description: `Disbursement voucher ${voucher.voucherNo} was created.`,
      status: createdStatus,
    },
  ];

  if (voucher.status !== createdStatus) {
    history.push(
      createDisbursementVoucherStatusHistoryEntry(
        voucher.status,
        voucher.voucherNo,
        createDisbursementVoucherHistoryDate(voucher.voucherDate, 9),
      ),
    );
  }

  return history;
}

function normalizeDisbursementVoucherHistoryEntry(entry: DisbursementVoucherHistoryEntry): DisbursementVoucherHistoryEntry {
  const status = getDisbursementVoucherDisplayStatus(entry.status);

  return {
    id: entry.id || `dv-history-${Date.now()}`,
    action: entry.action || getDisbursementVoucherHistoryAction(status),
    actor: entry.actor || "System",
    createdAt: entry.createdAt || new Date().toISOString(),
    description: entry.description || getDisbursementVoucherHistoryDescription(status, "this disbursement voucher"),
    status,
  };
}

function createDisbursementVoucherStatusHistoryEntry(
  status: DisbursementVoucherStatus,
  voucherNo: string,
  createdAt = new Date().toISOString(),
): DisbursementVoucherHistoryEntry {
  return {
    id: `dv-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action: getDisbursementVoucherHistoryAction(status),
    actor: "Current User",
    createdAt,
    description: getDisbursementVoucherHistoryDescription(status, voucherNo),
    status,
  };
}

function createDisbursementVoucherHistoryDate(voucherDate: string, hour: number) {
  const date = voucherDate || new Date().toISOString().slice(0, 10);

  return `${date}T${hour.toString().padStart(2, "0")}:00:00.000Z`;
}

function getDisbursementVoucherHistoryAction(status: DisbursementVoucherStatus) {
  if (status === DisbursementVoucherStatuses.posted) return DisbursementVoucherStatuses.posted;
  if (status === DisbursementVoucherStatuses.disapproved) return DisbursementVoucherStatuses.disapproved;
  if (status === DisbursementVoucherStatuses.cancelled) return DisbursementVoucherStatuses.cancelled;
  if (status === DisbursementVoucherStatuses.closed) return DisbursementVoucherStatuses.closed;
  if (status === DisbursementVoucherStatuses.forApproval) return DisbursementVoucherStatuses.forApproval;

  return "Updated";
}

function getDisbursementVoucherHistoryDescription(status: DisbursementVoucherStatus, voucherNo: string) {
  if (status === DisbursementVoucherStatuses.posted) return `${voucherNo} was posted for disbursement processing.`;
  if (status === DisbursementVoucherStatuses.disapproved) return `${voucherNo} was disapproved and returned for review.`;
  if (status === DisbursementVoucherStatuses.cancelled) return `${voucherNo} was cancelled.`;
  if (status === DisbursementVoucherStatuses.closed) return `${voucherNo} was closed.`;
  if (status === DisbursementVoucherStatuses.draft) return `${voucherNo} was restored to Draft.`;

  return `${voucherNo} was returned for approval.`;
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function createAutoDisbursementGeneratedRemarks(headerRemarks: string, expenseName: string, paymentMethod: string) {
  const remarks = headerRemarks.trim();

  if (remarks) {
    return {
      ewt: remarks,
      inputVat: remarks,
      settlement: remarks,
    };
  }

  const expenseSummary = expenseName.trim();
  const settlementMethod = paymentMethod.trim() || "payment";

  return {
    ewt: expenseSummary ? `EWT - ${expenseSummary}` : "EWT",
    inputVat: expenseSummary ? `Input VAT - ${expenseSummary}` : "Input VAT",
    settlement: expenseSummary ? `Settlement via ${settlementMethod} - ${expenseSummary}` : `Settlement via ${settlementMethod}`,
  };
}

function isBankReplaceableCreditEntry(entry: DisbursementLineEntry) {
  return (
    entry.id.startsWith("auto-credit-") ||
    entry.accountName === "Cash in Bank" ||
    entry.accountName.startsWith("Cash in Bank - ") ||
    entry.accountName === "Check Disbursement Clearing" ||
    entry.accountName === "Online Payment Clearing"
  );
}

function createCreditRemarks(
  transaction?: DisbursementTransactionRecord,
  bankAccount?: DisbursementVoucherBankAccount | null,
  paymentAccount?: DisbursementVoucherPaymentAccount | null,
) {
  const payee = transaction?.payee ? ` for ${transaction.payee}` : "";
  const paymentType = paymentAccount?.paymentType ?? transaction?.paymentMethod;
  const paymentLabel = paymentType ? ` via ${paymentType}` : "";

  if (bankAccount) {
    return [`Settlement${payee}${paymentLabel}`, bankAccount.bankName, bankAccount.branch].filter(Boolean).join(" - ");
  }

  return `Settlement${payee}${paymentLabel}`;
}

function getDebitAccountTemplate(transaction: DisbursementTransactionRecord) {
  if (transaction.disbursementType === "Vendor Payment") {
    return {
      accountCode: "5010-001",
      accountName: "Office Supplies Expense",
    };
  }

  if (transaction.disbursementType === "Operating Expense") {
    return {
      accountCode: "6050-010",
      accountName: "Operating Expense",
    };
  }

  if (transaction.disbursementType === "Reimbursement") {
    return {
      accountCode: "6150-017",
      accountName: "Travel and Transportation",
    };
  }

  return {
    accountCode: "1505-020",
    accountName: "Capital Expenditure in Progress",
  };
}

function getCreditAccountTemplate(
  transaction: DisbursementTransactionRecord,
  bankAccount?: DisbursementVoucherBankAccount | null,
) {
  if (bankAccount) {
    return {
      accountCode: bankAccount.accountCode,
      accountName: bankAccount.accountTitle,
    };
  }

  if (transaction.paymentMethod === "Cash") {
    return { ...CashInHandAccount };
  }

  return {
    accountCode: "",
    accountName: "Cash in Bank",
  };
}

function getDefaultTaxRate(transaction: DisbursementTransactionRecord) {
  const taxProfile = getDefaultTaxProfile(transaction);

  return taxProfile.vatPercent > 0 ? `${taxProfile.vatPercent}%` : "0%";
}

function createDefaultTransactionTaxDetails(transaction: DisbursementTransactionRecord) {
  return createDisbursementTaxDetails({
    amount: transaction.amount,
    ...getDefaultTaxProfile(transaction),
  });
}

function getDefaultTaxProfile(transaction: DisbursementTransactionRecord) {
  if (transaction.disbursementType === "Operating Expense") {
    return {
      ewtCode: "W10",
      ewtPercent: 10,
      vatCode: "V12",
      vatPercent: 12,
    };
  }

  if (transaction.disbursementType === "Capital Expenditure") {
    return {
      ewtCode: "",
      ewtPercent: 0,
      vatCode: "V12",
      vatPercent: 12,
    };
  }

  return {
    ewtCode: "",
    ewtPercent: 0,
    vatCode: "",
    vatPercent: 0,
  };
}

function createDisbursementTaxDetails({
  amount,
  ewtCode = "",
  ewtPercent = 0,
  vatCode = "",
  vatPercent = 0,
}: {
  amount: number;
  ewtCode?: string;
  ewtPercent?: number;
  vatCode?: string;
  vatPercent?: number;
}): DisbursementTaxDetails {
  const roundedAmount = roundCurrency(amount);
  const sign = roundedAmount < 0 ? -1 : 1;
  const absoluteAmount = Math.abs(roundedAmount);
  const vatAmount = roundCurrency(sign * ((absoluteAmount * vatPercent) / 100));
  const ewtAmount = roundCurrency(sign * ((absoluteAmount * ewtPercent) / 100));

  return {
    code: "",
    name: "",
    responsibilityCenter: "",
    refId: "",
    vatType: vatCode,
    grossAmount: roundedAmount,
    netAmount: roundCurrency(sign * Math.max(absoluteAmount - Math.abs(vatAmount), 0)),
    vatCode,
    vatPercent,
    vatAmount,
    ewtCode,
    ewtPercent,
    ewtAmount,
    amount: roundCurrency(sign * Math.max(absoluteAmount - Math.abs(ewtAmount), 0)),
  };
}

function parseTaxPercent(taxRate: string) {
  return Number(taxRate.replace("%", "")) || 0;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
