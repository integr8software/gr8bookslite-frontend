import type {
  CashVoucherAttachment,
  CashVoucherBankAccount,
  CashVoucherPaymentAccount,
  CashVoucherCopyFromRecord,
  CashVoucherLineEntry,
  CashVoucherPaymentDetails,
  CashVoucherStatus,
  CashVoucherDisplayStatus,
  CashVoucherTaxDetails,
  CashVoucherTransactionRecord,
  CashVoucherEntryDraft,
  CashVoucherFormValues,
  CashVoucherHistoryEntry,
  CashVoucherRecord,
  CashVoucherGeneratedAccount,
  CashVoucherGeneratedAccountOptions,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { CashVoucherStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { formatCurrency as formatCurrencyValue, roundCurrency } from "@/app/src/utils/currency.util";
import { parseTaxPercent } from "@/app/src/utils/percentage.util";

export const CashVoucherInitialEntryDraft: CashVoucherEntryDraft = {
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

export function createBlankCashVoucherLineEntry(overrides: Partial<CashVoucherLineEntry> = {}): CashVoucherLineEntry {
  const refId = overrides.refId ?? "";
  const responsibilityCenter = overrides.responsibilityCenter ?? "";
  const particulars = overrides.particulars ?? overrides.remarks ?? "";

  return {
    accountCode: "",
    accountName: "",
    ewtCode: "",
    checkDate: "",
    checkNo: "",
    checkStatus: "",
    credit: 0,
    debit: 0,
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    particulars,
    remarks: particulars,
    partyCode: "",
    partyName: "",
    refId,
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

export function ensureCashVoucherLineEntries(entries: CashVoucherLineEntry[]) {
  return entries.length > 0 ? entries : [createBlankCashVoucherLineEntry()];
}

export const CashVoucherTransactions: CashVoucherTransactionRecord[] = [];
export const CashVouchers: CashVoucherRecord[] = [];

const LegacyDemoAttachmentNames = new Set([
  "invoice-office-depot.pdf",
  "approval-memo-q2.docx",
  "retainer-billing.pdf",
  "travel-receipts.zip",
]);

export function removeLegacyDemoAttachments(attachments?: CashVoucherAttachment[] | null) {
  return (attachments ?? []).filter((attachment) => !LegacyDemoAttachmentNames.has(attachment.name));
}

export function sanitizeCashVoucherRecord(voucher: CashVoucherRecord): CashVoucherRecord {
  const createdAt = voucher.createdAt ?? voucher.history?.[0]?.createdAt ?? "";
  const updatedAt = voucher.updatedAt ?? voucher.history?.[voucher.history.length - 1]?.createdAt ?? createdAt;
  const lineEntries = normalizeGeneratedCashVoucherRemarks(voucher.lineEntries ?? []);

  return {
    ...voucher,
    referenceModule: voucher.referenceModule ?? "",
    paymentDetails: normalizePaymentDetails(voucher.paymentDetails ?? createEmptyPaymentDetails()),
    attachments: removeLegacyDemoAttachments(voucher.attachments),
    status: getCashVoucherDisplayStatus(voucher.status),
    history: voucher.history?.length > 0 ? voucher.history.map(normalizeCashVoucherHistoryEntry) : createInitialCashVoucherHistory(voucher),
    createdBy: voucher.createdBy ?? voucher.preparedBy ?? "",
    createdAt,
    lineEntries,
    updatedBy: voucher.updatedBy ?? voucher.preparedBy ?? "",
    updatedAt,
  };
}

function normalizeGeneratedCashVoucherRemarks(entries: CashVoucherLineEntry[]) {
  const sourceEntry = entries.find((entry) => !isGeneratedCashVoucherLineEntry(entry));
  const sourceRemarks = (sourceEntry?.particulars || sourceEntry?.remarks || "").trim();
  const sourceCreatedRemarks = sourceEntry?.accountName.trim() ?? "";
  const hasUserRemarks = sourceRemarks !== "" && sourceRemarks !== sourceCreatedRemarks;

  if (!hasUserRemarks) {
    return entries;
  }

  return entries.map((entry) => {
    const entryRemarks = entry.particulars || entry.remarks || "";
    if (!isGeneratedCashVoucherLineEntry(entry) || !hasGeneratedCashVoucherRemarkPrefix(entryRemarks)) {
      return entry;
    }

    const nextRemarks = stripGeneratedCashVoucherRemarkPrefix(entryRemarks, sourceRemarks);
    return {
      ...entry,
      particulars: nextRemarks,
      remarks: nextRemarks,
    };
  });
}

function isGeneratedCashVoucherLineEntry(entry: CashVoucherLineEntry) {
  const accountName = entry.accountName.trim().toLowerCase();

  return (
    entry.id.startsWith("auto-input-vat-") ||
    entry.id.startsWith("auto-ewt-") ||
    entry.id.startsWith("auto-credit-") ||
    accountName === "input vat" ||
    accountName === "expanded withholding tax" ||
    accountName === "cash on hand" ||
    accountName.startsWith("cash in bank")
  );
}

function hasGeneratedCashVoucherRemarkPrefix(remarks: string) {
  const trimmedRemarks = remarks.trim();

  return getGeneratedCashVoucherRemarkPrefixPatterns().some((pattern) => pattern.test(trimmedRemarks));
}

function stripGeneratedCashVoucherRemarkPrefix(remarks: string, fallbackRemarks: string) {
  const trimmedRemarks = remarks.trim();

  for (const pattern of getGeneratedCashVoucherRemarkPrefixPatterns()) {
    if (pattern.test(trimmedRemarks)) {
      return trimmedRemarks.replace(pattern, "").trim() || fallbackRemarks;
    }
  }

  return trimmedRemarks || fallbackRemarks;
}

function getGeneratedCashVoucherRemarkPrefixPatterns() {
  return [
    /^Input VAT\s*-\s*/i,
    /^EWT\s*-\s*/i,
    /^Expanded Withholding Tax\s*-\s*/i,
    /^Settlement via .*?\s*-\s*/i,
    /^Settlement(?:\s+for.*?)?(?:\s+via.*?)?$/i,
  ];
}

export function buildCashVoucherPreviewRows(transactions: CashVoucherTransactionRecord[], vouchers: CashVoucherRecord[]) {
  const voucherByTransactionId = new Map(vouchers.map((voucher) => [voucher.transactionId, voucher]));

  return transactions.map((transaction) => ({
    transaction,
    voucher: voucherByTransactionId.get(transaction.id),
  }));
}

export function createCashVoucherFormValues(
  transaction?: CashVoucherTransactionRecord,
  voucher?: CashVoucherRecord,
): CashVoucherFormValues {
  if (voucher) {
    const voucherGrossAmount = getCashVoucherSourceGrossTotal(voucher.lineEntries) || voucher.amount;

    return {
      transactionId: voucher.transactionId,
      voucherNo: voucher.voucherNo,
      voucherDate: voucher.voucherDate,
      paymentMethod: voucher.paymentMethod,
      disbursementType: voucher.disbursementType,
      currency: voucher.currency,
      fxRate: voucher.fxRate,
      costCenter: voucher.projectCode ?? voucher.costCenter,
      projectCode: voucher.projectCode ?? voucher.costCenter,
      projectName: voucher.projectName ?? transaction?.projectName ?? transaction?.department ?? "",
      partyCode: voucher.partyCode,
      partyName: voucher.partyName,
      amount: voucherGrossAmount.toFixed(2),
      taxRate: voucher.taxRate,
      taxDetails: syncTaxDetailsAmount(voucher.taxDetails, voucherGrossAmount, voucher.taxRate),
      remarks: voucher.remarks,
      referenceModule: voucher.referenceModule ?? "",
      voucherReferenceNo: voucher.voucherReferenceNo,
      invoiceReferenceNo: voucher.invoiceReferenceNo,
      paymentDueDate: voucher.paymentDueDate,
      paymentDetails: voucher.paymentDetails,
      preparedBy: voucher.preparedBy,
      status: voucher.status,
      lineEntries: ensureCashVoucherLineEntries(voucher.lineEntries),
      attachments: removeLegacyDemoAttachments(voucher.attachments),
    };
  }

  return {
    taxRate: transaction ? getDefaultTaxRate() : "0%",
    taxDetails: transaction ? createDefaultTransactionTaxDetails(transaction) : createTaxDetails(0, "0%"),
    transactionId: transaction?.id ?? "",
    voucherNo: "",
    voucherDate: todayDateValue(),
    paymentMethod: "Cash",
    disbursementType: transaction?.disbursementType ?? "",
    currency: transaction?.currency ?? "PHP",
    fxRate: "1.00",
    costCenter: transaction?.projectCode ?? transaction?.costCenter ?? "",
    projectCode: transaction?.projectCode ?? transaction?.costCenter ?? "",
    projectName: transaction?.projectName ?? transaction?.department ?? "",
    partyCode: getCashVoucherPartyCode(transaction?.payee ?? ""),
    partyName: transaction?.payee ?? "",
    amount: transaction ? transaction.amount.toFixed(2) : "",
    remarks: transaction?.purpose ?? "",
    referenceModule: "Cash Voucher",
    voucherReferenceNo: "",
    invoiceReferenceNo: "",
    paymentDueDate: transaction?.paymentDueDate ?? todayDateValue(),
    paymentDetails: createEmptyPaymentDetails(),
    preparedBy: "Finance Shared Services",
    status: CashVoucherStatuses.Open,
    lineEntries: transaction
      ? ensureCashVoucherLineEntries(createAutoCashVoucherLineEntries(transaction))
      : [createBlankCashVoucherLineEntry()],
    attachments: [],
  };
}

function getCashVoucherSourceGrossTotal(entries: CashVoucherLineEntry[]) {
  return entries
    .filter((entry) => !isGeneratedCashVoucherLineEntry(entry))
    .reduce((sum, entry) => {
      const grossAmount = Number(entry.taxDetails?.grossAmount || entry.debit || 0);

      return sum + grossAmount;
    }, 0);
}

export function createCashVoucherFromForm(values: CashVoucherFormValues): CashVoucherRecord {
  const now = new Date().toISOString();
  const actor = values.preparedBy.trim() || "Current User";

  return {
    id: `cv-${Date.now()}`,
    transactionId: values.transactionId,
    voucherNo: values.voucherNo.trim(),
    voucherDate: values.voucherDate,
    paymentMethod: "Cash",
    disbursementType: values.disbursementType as CashVoucherRecord["disbursementType"],
    currency: values.currency,
    fxRate: values.fxRate.trim() || "1.00",
    costCenter: values.projectCode.trim() || values.costCenter.trim(),
    projectCode: values.projectCode.trim() || values.costCenter.trim(),
    projectName: values.projectName.trim(),
    partyCode: values.partyCode.trim(),
    partyName: values.partyName.trim(),
    amount: parseMoneyNumberInput(values.amount),
    taxRate: values.taxRate,
    taxDetails: syncTaxDetailsAmount(values.taxDetails, parseMoneyNumberInput(values.amount), values.taxRate),
    remarks: values.remarks.trim(),
    referenceModule: values.referenceModule.trim(),
    voucherReferenceNo: values.voucherReferenceNo.trim(),
    invoiceReferenceNo: values.invoiceReferenceNo.trim(),
    paymentDueDate: values.paymentDueDate,
    paymentDetails: normalizePaymentDetails(values.paymentDetails),
    preparedBy: values.preparedBy.trim(),
    status: values.status,
    lineEntries: ensureCashVoucherLineEntries(values.lineEntries),
    attachments: removeLegacyDemoAttachments(values.attachments),
    history: createInitialCashVoucherHistory({
      voucherNo: values.voucherNo.trim(),
      voucherDate: values.voucherDate,
      status: values.status,
    }),
    createdBy: actor,
    createdAt: now,
    updatedBy: actor,
    updatedAt: now,
  };
}

export function createCashVoucherTransactionFromForm(
  values: CashVoucherFormValues,
  transaction?: CashVoucherTransactionRecord,
): CashVoucherTransactionRecord {
  const now = new Date().toISOString();
  const actor = values.preparedBy.trim() || "Finance Shared Services";

  return {
    id: transaction?.id ?? values.transactionId,
    transactionNo: transaction?.transactionNo ?? (values.transactionId.trim() || createNextTransactionNumber()),
    payee: values.partyName.trim() || transaction?.payee || "Unnamed Payee",
    purpose: values.remarks.trim() || transaction?.purpose || "CashVoucher voucher",
    department: values.projectName.trim() || transaction?.department || "Finance Operations",
    projectName: values.projectName.trim(),
    requestedBy: transaction?.requestedBy ?? (values.preparedBy.trim() || "Finance Shared Services"),
    transactionDate: transaction?.transactionDate ?? values.voucherDate,
    paymentDueDate: values.paymentDueDate,
    amount: parseMoneyNumberInput(values.amount),
    currency: values.currency,
    paymentMethod: "Cash",
    disbursementType: values.disbursementType as CashVoucherTransactionRecord["disbursementType"],
    status: values.status,
    costCenter: values.projectCode.trim() || values.costCenter.trim(),
    projectCode: values.projectCode.trim() || values.costCenter.trim(),
    accountingEntries: ensureCashVoucherLineEntries(values.lineEntries),
    createdBy: transaction?.createdBy ?? actor,
    createdAt: transaction?.createdAt ?? now,
    updatedBy: actor,
    updatedAt: now,
  };
}

export function applyCopyFromRecordToCashVoucherForm(
  currentValues: CashVoucherFormValues,
  record: CashVoucherCopyFromRecord,
): CashVoucherFormValues {
  return {
    ...currentValues,
    transactionId: record.transactionId,
    paymentMethod: "Cash",
    disbursementType: record.templateValues.disbursementType,
    currency: record.templateValues.currency,
    fxRate: record.templateValues.fxRate,
    costCenter: record.templateValues.projectCode || record.templateValues.costCenter,
    projectCode: record.templateValues.projectCode || record.templateValues.costCenter,
    projectName: record.templateValues.projectName,
    partyCode: record.templateValues.partyCode,
    partyName: record.templateValues.partyName,
    amount: record.templateValues.amount,
    taxRate: record.templateValues.taxRate,
    taxDetails: record.templateValues.taxDetails,
    remarks: record.templateValues.remarks,
    referenceModule: record.templateValues.referenceModule || record.source,
    voucherReferenceNo: record.templateValues.voucherReferenceNo,
    invoiceReferenceNo: record.templateValues.invoiceReferenceNo,
    paymentDueDate: record.templateValues.paymentDueDate,
    paymentDetails: record.templateValues.paymentDetails,
    lineEntries: ensureCashVoucherLineEntries(record.templateValues.lineEntries),
    attachments: removeLegacyDemoAttachments(record.templateValues.attachments),
  };
}

export function applyCopyFromRecordsToCashVoucherForm(
  currentValues: CashVoucherFormValues,
  records: CashVoucherCopyFromRecord[],
): CashVoucherFormValues {
  if (records.length === 0) {
    return currentValues;
  }

  const firstRecord = records[0];
  if (!firstRecord) {
    return currentValues;
  }

  if (records.length === 1) {
    return applyCopyFromRecordToCashVoucherForm(currentValues, firstRecord);
  }

  const firstValues = firstRecord.templateValues;
  const totalAmount = records.reduce((sum, record) => sum + Number(record.templateValues.amount || 0), 0);
  const sourceNumbers = records.map((record) => record.sourceNo).join(", ");
  const combinedRemarks = records
    .map((record) => record.templateValues.remarks || record.remarks)
    .filter(Boolean)
    .join("\n");
  const lineEntries = records.flatMap((record, recordIndex) =>
    record.templateValues.lineEntries.map((entry) => ({
      ...entry,
      id: `${record.id}-${recordIndex}-${entry.id}`,
      refId: entry.refId || record.sourceNo,
      taxDetails: {
        ...entry.taxDetails,
        refId: entry.taxDetails.refId || entry.refId || record.sourceNo,
      },
    })),
  );
  const attachments = records.flatMap((record) => removeLegacyDemoAttachments(record.templateValues.attachments));

  return {
    ...currentValues,
    transactionId: firstRecord.transactionId,
    paymentMethod: "Cash",
    disbursementType: firstValues.disbursementType,
    currency: firstValues.currency,
    fxRate: firstValues.fxRate,
    costCenter: firstValues.projectCode || firstValues.costCenter,
    projectCode: firstValues.projectCode || firstValues.costCenter,
    projectName: firstValues.projectName,
    partyCode: records.every((record) => record.partyCode === firstRecord.partyCode) ? firstValues.partyCode : "",
    partyName: records.every((record) => record.partyName === firstRecord.partyName) ? firstValues.partyName : "Multiple Parties",
    amount: totalAmount.toFixed(2),
    taxRate: firstValues.taxRate,
    taxDetails: syncTaxDetailsAmount(firstValues.taxDetails, totalAmount, firstValues.taxRate),
    remarks: combinedRemarks,
    referenceModule: firstRecord.source,
    voucherReferenceNo: sourceNumbers,
    invoiceReferenceNo: sourceNumbers,
    paymentDueDate: firstValues.paymentDueDate,
    paymentDetails: firstValues.paymentDetails,
    lineEntries: ensureCashVoucherLineEntries(lineEntries),
    attachments,
  };
}

export function updateCashVoucherFromForm(voucher: CashVoucherRecord, values: CashVoucherFormValues) {
  const updatedVoucher = createCashVoucherFromForm(values);
  const actor = values.preparedBy.trim() || "Current User";

  return {
    ...updatedVoucher,
    id: voucher.id,
    createdBy: voucher.createdBy ?? updatedVoucher.createdBy,
    createdAt: voucher.createdAt ?? updatedVoucher.createdAt,
    history: voucher.history,
    updatedBy: actor,
    updatedAt: new Date().toISOString(),
  };
}

export function createCashVoucherStatusHistoryEntry(
  status: CashVoucherStatus,
  voucherNo: string,
  createdAt = new Date().toISOString(),
): CashVoucherHistoryEntry {
  return {
    id: `cv-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action: getCashVoucherHistoryAction(status),
    actor: "Current User",
    createdAt,
    description: getCashVoucherHistoryDescription(status, voucherNo),
    status,
  };
}

export function createCashVoucherLineEntry(draft: CashVoucherEntryDraft): CashVoucherLineEntry {
  const amount = parseMoneyNumberInput(draft.debit) || parseMoneyNumberInput(draft.credit);
  const taxDetails = syncTaxDetailsAmount(
    {
      ...draft.taxDetails,
      ewtCode: draft.ewtCode?.trim() ?? draft.taxDetails.ewtCode,
      refId: draft.refId?.trim() ?? draft.taxDetails.refId,
      responsibilityCenter: draft.responsibilityCenter?.trim() ?? draft.taxDetails.responsibilityCenter,
      vatType: draft.vatType?.trim() ?? draft.taxDetails.vatType,
    },
    amount,
    draft.taxRate,
  );

  return {
    id: `line-${Date.now()}`,
    accountCode: draft.accountCode.trim(),
    accountName: draft.accountName.trim(),
    ewtCode: taxDetails.ewtCode,
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

export function createAutoCashVoucherLineEntries(
  transaction: CashVoucherTransactionRecord,
  bankAccount?: CashVoucherBankAccount | null,
  paymentAccount?: CashVoucherPaymentAccount | null,
  accountOptions: CashVoucherGeneratedAccountOptions = {},
): CashVoucherLineEntry[] {
  const bankPaymentAccount = bankAccount ?? null;
  const amount = transaction.amount;
  const debitAccount = getDebitAccountTemplate(transaction);
  const creditAccount = getCreditAccountTemplate(transaction, bankPaymentAccount, paymentAccount, accountOptions.cashAccount);
  const taxProfile = getDefaultTaxProfile();
  const taxDetails = createCashVoucherTaxDetails({
    amount,
    ...taxProfile,
  });
  const refId = transaction.transactionNo || transaction.id;
  const generatedRemarks = createAutoCashVoucherGeneratedRemarks(transaction.purpose, debitAccount.accountName, transaction.paymentMethod);
  const commonFields = {
    partyCode: getCashVoucherPartyCode(transaction.payee),
    partyName: transaction.payee,
    refId,
    responsibilityCenter: transaction.costCenter,
  };
  const entries: CashVoucherLineEntry[] = [
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
      taxDetails: {
        ...taxDetails,
        ...commonFields,
      },
      vatType: taxProfile.vatCode,
      status: "Balanced",
    },
  ];

  if (taxDetails.vatAmount > 0) {
    entries.push({
      id: `auto-input-vat-${transaction.id}`,
      accountCode: accountOptions.inputVatAccount?.accountCode ?? "",
      accountName: accountOptions.inputVatAccount?.accountName ?? "",
      ewtCode: "",
      particulars: generatedRemarks.inputVat,
      remarks: generatedRemarks.inputVat,
      ...commonFields,
      debit: taxDetails.vatAmount,
      credit: 0,
      taxRate: "0%",
      taxDetails: {
        ...createTaxDetails(taxDetails.vatAmount, "0%"),
        ...commonFields,
      },
      vatType: "Input VAT",
      status: "Balanced",
    });
  }

  if (taxDetails.ewtAmount > 0) {
    entries.push({
      id: `auto-ewt-${transaction.id}`,
      accountCode: accountOptions.withholdingTaxAccount?.accountCode ?? "",
      accountName: accountOptions.withholdingTaxAccount?.accountName ?? "",
      ewtCode: taxDetails.ewtCode,
      particulars: generatedRemarks.ewt,
      remarks: generatedRemarks.ewt,
      ...commonFields,
      debit: 0,
      credit: taxDetails.ewtAmount,
      taxRate: "0%",
      taxDetails: {
        ...createTaxDetails(taxDetails.ewtAmount, "0%"),
        ...commonFields,
      },
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
    taxDetails: {
      ...createTaxDetails(taxDetails.amount, "0%"),
      ...commonFields,
    },
    vatType: "",
    status: "Balanced",
  });

  return entries;
}

function createAutoCashVoucherGeneratedRemarks(headerRemarks: string, expenseName: string, paymentMethod: string) {
  const remarks = headerRemarks.trim();

  if (remarks) {
    return {
      ewt: remarks,
      inputVat: remarks,
      settlement: remarks,
    };
  }

  const expenseSummary = expenseName.trim();
  const settlementMethod = paymentMethod.trim() || "Cash";

  return {
    ewt: expenseSummary ? `EWT - ${expenseSummary}` : "EWT",
    inputVat: expenseSummary ? `Input VAT - ${expenseSummary}` : "Input VAT",
    settlement: expenseSummary ? `Settlement via ${settlementMethod} - ${expenseSummary}` : `Settlement via ${settlementMethod}`,
  };
}

export function applyBankAccountToPaymentDetails(
  paymentDetails: CashVoucherPaymentDetails,
  bankAccount: CashVoucherBankAccount | null,
): CashVoucherPaymentDetails {
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
    bankAccountTitle: bankAccount.accountTitle,
    bankAccountName: bankAccount.accountName,
    bankAccountNo: bankAccount.accountNo,
    bankBranch: bankAccount.branch,
    bankName: bankAccount.bankName,
  };
}

export function applyBankAccountToCashVoucherLineEntries(
  entries: CashVoucherLineEntry[],
  bankAccount: CashVoucherBankAccount | null,
  paymentAccount?: CashVoucherPaymentAccount | null,
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

function isBankReplaceableCreditEntry(entry: CashVoucherLineEntry) {
  return (
    entry.id.startsWith("auto-credit-") ||
    entry.accountName === "Cash in Bank" ||
    entry.accountName.startsWith("Cash in Bank - ") ||
    entry.accountName === "Check CashVoucher Clearing" ||
    entry.accountName === "Online Payment Clearing"
  );
}

export function createTaxDetails(amount: number, taxRate: string): CashVoucherTaxDetails {
  const roundedAmount = roundCurrency(amount);
  const sign = roundedAmount < 0 ? -1 : 1;
  const absoluteAmount = Math.abs(roundedAmount);
  const vatPercent = parseTaxPercent(taxRate);
  const vatAmount = roundCurrency(sign * ((absoluteAmount * vatPercent) / 100));
  const ewtPercent = 0;
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
    ewtPercent,
    ewtAmount,
    amount: totalPayable,
  };
}

export function syncTaxDetailsAmount(currentTaxDetails: CashVoucherTaxDetails | undefined, amount: number, taxRate: string) {
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

function createCashVoucherTaxDetails({
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
}): CashVoucherTaxDetails {
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

export function formatTaxRateSummary(taxDetails: CashVoucherTaxDetails) {
  const vatLabel = taxDetails.vatPercent > 0 ? `VAT ${taxDetails.vatPercent}%` : "";
  const ewtLabel = taxDetails.ewtPercent > 0 ? ` / EWT ${taxDetails.ewtPercent}%` : "";

  return `${vatLabel}${ewtLabel}`;
}

export function createAttachmentPlaceholders(): CashVoucherAttachment[] {
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

export function getCashVoucherDisplayStatus(status: string): CashVoucherDisplayStatus {
  const normalizedStatus = status
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (normalizedStatus === "DRAFT") {
    return CashVoucherStatuses.Draft;
  }

  if (normalizedStatus === "FOR_APPROVAL") {
    return CashVoucherStatuses.ForApproval;
  }

  if (normalizedStatus === "APPROVED" || normalizedStatus === "POSTED") {
    return CashVoucherStatuses.Posted;
  }

  if (normalizedStatus === "DISAPPROVED" || normalizedStatus === "REJECTED") {
    return CashVoucherStatuses.Disapproved;
  }

  if (normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED") {
    return CashVoucherStatuses.Cancelled;
  }

  if (normalizedStatus === "CLOSED" || normalizedStatus === "COMPLETED") {
    return CashVoucherStatuses.Closed;
  }

  if (status === CashVoucherStatuses.Draft || status === CashVoucherStatuses.Open) {
    return CashVoucherStatuses.Draft;
  }

  if (status === "Pending Review" || status === "Pending" || status === "Active") {
    return CashVoucherStatuses.ForApproval;
  }

  if (status === "Rejected") {
    return CashVoucherStatuses.Disapproved;
  }

  if (status === "Completed") {
    return CashVoucherStatuses.Closed;
  }

  if (status === "Approved") {
    return CashVoucherStatuses.Posted;
  }

  if (
    status === CashVoucherStatuses.Draft ||
    status === CashVoucherStatuses.ForApproval ||
    status === CashVoucherStatuses.Posted ||
    status === CashVoucherStatuses.Disapproved ||
    status === CashVoucherStatuses.Cancelled ||
    status === CashVoucherStatuses.Closed
  ) {
    return status;
  }

  return CashVoucherStatuses.Draft;
}

function createInitialCashVoucherHistory(
  voucher: Pick<CashVoucherRecord, "voucherNo" | "voucherDate" | "status">,
): CashVoucherHistoryEntry[] {
  const createdStatus = voucher.status === CashVoucherStatuses.Draft ? CashVoucherStatuses.Draft : CashVoucherStatuses.ForApproval;
  const createdAt = createCashVoucherHistoryDate(voucher.voucherDate, 8);
  const history: CashVoucherHistoryEntry[] = [
    {
      id: `cv-history-${voucher.voucherNo}-created`,
      action: "Created",
      actor: "System",
      createdAt,
      description: `CashVoucher voucher ${voucher.voucherNo} was created.`,
      status: createdStatus,
    },
  ];

  if (voucher.status !== createdStatus) {
    history.push(
      createCashVoucherStatusHistoryEntry(voucher.status, voucher.voucherNo, createCashVoucherHistoryDate(voucher.voucherDate, 9)),
    );
  }

  return history;
}

function normalizeCashVoucherHistoryEntry(entry: CashVoucherHistoryEntry): CashVoucherHistoryEntry {
  const status = getCashVoucherDisplayStatus(entry.status);

  return {
    id: entry.id || `cv-history-${Date.now()}`,
    action: entry.action || getCashVoucherHistoryAction(status),
    actor: entry.actor || "System",
    createdAt: entry.createdAt || new Date().toISOString(),
    description: entry.description || getCashVoucherHistoryDescription(status, "this cash voucher"),
    status,
  };
}

function createCashVoucherHistoryDate(voucherDate: string, hour: number) {
  const date = voucherDate || new Date().toISOString().slice(0, 10);

  return `${date}T${hour.toString().padStart(2, "0")}:00:00.000Z`;
}

function getCashVoucherHistoryAction(status: CashVoucherStatus) {
  if (status === CashVoucherStatuses.Posted) {
    return CashVoucherStatuses.Posted;
  }

  if (status === CashVoucherStatuses.Disapproved) {
    return CashVoucherStatuses.Disapproved;
  }

  if (status === CashVoucherStatuses.Cancelled) {
    return CashVoucherStatuses.Cancelled;
  }

  if (status === CashVoucherStatuses.Closed) {
    return CashVoucherStatuses.Closed;
  }

  if (status === CashVoucherStatuses.ForApproval) {
    return CashVoucherStatuses.ForApproval;
  }

  return "Updated";
}

function getCashVoucherHistoryDescription(status: CashVoucherStatus, voucherNo: string) {
  if (status === CashVoucherStatuses.Posted) {
    return `${voucherNo} was posted for disbursement processing.`;
  }

  if (status === CashVoucherStatuses.Disapproved) {
    return `${voucherNo} was disapproved and returned for review.`;
  }

  if (status === CashVoucherStatuses.Cancelled) {
    return `${voucherNo} was cancelled.`;
  }

  if (status === CashVoucherStatuses.Closed) {
    return `${voucherNo} was closed.`;
  }

  if (status === CashVoucherStatuses.Draft) {
    return `${voucherNo} was restored to Draft.`;
  }

  return `${voucherNo} was returned for approval.`;
}

export function isCashVoucherForApprovalStatus(status: string) {
  const displayStatus = getCashVoucherDisplayStatus(status);

  return displayStatus === CashVoucherStatuses.ForApproval;
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function createNextTransactionNumber() {
  const currentYear = new Date().getFullYear();
  const serial = String(Date.now() % 100000).padStart(5, "0");

  return `TXN-${currentYear}-${serial}`;
}

function getDebitAccountTemplate(transaction: CashVoucherTransactionRecord) {
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
  transaction: CashVoucherTransactionRecord,
  bankAccount?: CashVoucherBankAccount | null,
  paymentAccount?: CashVoucherPaymentAccount | null,
  cashAccount?: CashVoucherGeneratedAccount | null,
) {
  if (bankAccount) {
    return {
      accountCode: bankAccount.accountCode,
      accountName: bankAccount.accountTitle,
    };
  }

  if (paymentAccount?.type === "Cash") {
    return {
      accountCode: cashAccount?.accountCode ?? "",
      accountName: cashAccount?.accountName ?? "",
    };
  }

  if (transaction.paymentMethod === "Cash") {
    return {
      accountCode: cashAccount?.accountCode ?? "",
      accountName: cashAccount?.accountName ?? "",
    };
  }

  return {
    accountCode: "",
    accountName: "Cash in Bank",
  };
}

function createCreditRemarks(
  transaction?: CashVoucherTransactionRecord,
  bankAccount?: CashVoucherBankAccount | null,
  paymentAccount?: CashVoucherPaymentAccount | null,
) {
  const payee = transaction?.payee ? ` for ${transaction.payee}` : "";
  const paymentType = paymentAccount?.paymentType ?? transaction?.paymentMethod;
  const paymentLabel = paymentType ? ` via ${paymentType}` : "";

  if (bankAccount) {
    return [`Settlement${payee}${paymentLabel}`, bankAccount.bankName, bankAccount.branch].filter(Boolean).join(" - ");
  }

  return `Settlement${payee}${paymentLabel}`;
}

function getDefaultTaxRate() {
  const taxProfile = getDefaultTaxProfile();

  return taxProfile.vatPercent > 0 ? `${taxProfile.vatPercent}%` : "0%";
}

function createDefaultTransactionTaxDetails(transaction: CashVoucherTransactionRecord) {
  return createCashVoucherTaxDetails({
    amount: transaction.amount,
    ...getDefaultTaxProfile(),
  });
}

function getDefaultTaxProfile() {
  return {
    ewtCode: "",
    ewtPercent: 0,
    vatCode: "",
    vatPercent: 0,
  };
}

export function createEmptyPaymentDetails(): CashVoucherPaymentDetails {
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

function normalizePaymentDetails(paymentDetails: CashVoucherPaymentDetails): CashVoucherPaymentDetails {
  return {
    bankAccountCode: paymentDetails.bankAccountCode?.trim() ?? "",
    bankAccountName: paymentDetails.bankAccountName.trim(),
    bankAccountNo: paymentDetails.bankAccountNo.trim(),
    bankAccountTitle: paymentDetails.bankAccountTitle?.trim() ?? "",
    bankBranch: paymentDetails.bankBranch.trim(),
    bankName: paymentDetails.bankName.trim(),
    checkDate: paymentDetails.checkDate,
    checkNo: paymentDetails.checkNo.trim(),
    checkStatus: paymentDetails.checkStatus?.trim() ?? "",
    isMultiCheckNumber: Boolean(paymentDetails.isMultiCheckNumber),
    payee: paymentDetails.payee?.trim() ?? "",
    paymentReferenceNo: paymentDetails.paymentReferenceNo.trim(),
    transferAccountName: paymentDetails.transferAccountName?.trim() ?? "",
    transferAccountNo: paymentDetails.transferAccountNo?.trim() ?? "",
    transferToBank: paymentDetails.transferToBank?.trim() ?? "",
    transferTo: paymentDetails.transferTo?.trim() ?? "",
  };
}

function getCashVoucherPartyCode(partyName: string) {
  void partyName;
  return "";
}
