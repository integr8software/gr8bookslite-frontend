import type {
  CashVoucherAttachment,
  CashVoucherPaymentMethod,
  CashVoucherBankAccount,
  CashVoucherPaymentAccount,
  CashVoucherCopyFromRecord,
  CashVoucherCopySource,
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
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  CashVoucherRecordStorageKey,
  CashVoucherStatuses,
  CashVoucherTransactionStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
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

export function getSeedCashVoucherTransactions() {
  return MockCashVoucherTransactions.filter((transaction) => transaction.paymentMethod === "Cash").map((transaction) => ({
    ...transaction,
    status: getCashVoucherDisplayStatus(transaction.status),
  }));
}

export function getSeedCashVouchers() {
  return MockCashVouchers.filter((voucher) => voucher.paymentMethod === "Cash").map(sanitizeCashVoucherRecord);
}

export function readStoredCashVoucherTransactions() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTransactions = window.localStorage.getItem(CashVoucherTransactionStorageKey);

  if (!storedTransactions) {
    return null;
  }

  try {
    const parsedTransactions = JSON.parse(storedTransactions) as CashVoucherTransactionRecord[];

    return Array.isArray(parsedTransactions)
      ? parsedTransactions.map((transaction) => ({
          ...transaction,
          status: getCashVoucherDisplayStatus(transaction.status),
        }))
      : null;
  } catch {
    return null;
  }
}

export function readStoredCashVouchers() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedVouchers = window.localStorage.getItem(CashVoucherRecordStorageKey);

  if (!storedVouchers) {
    return null;
  }

  try {
    const parsedVouchers = JSON.parse(storedVouchers) as CashVoucherRecord[];

    if (!Array.isArray(parsedVouchers)) {
      return null;
    }

    return parsedVouchers.map(sanitizeCashVoucherRecord);
  } catch {
    return null;
  }
}

export function writeStoredCashVoucherTransactions(transactions: CashVoucherTransactionRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CashVoucherTransactionStorageKey, JSON.stringify(transactions));
}

export function writeStoredCashVouchers(vouchers: CashVoucherRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CashVoucherRecordStorageKey, JSON.stringify(vouchers.map(sanitizeCashVoucherRecord)));
}

export const CashVoucherInitialEntryDraft: CashVoucherEntryDraft = {
  accountCode: "",
  accountName: "",
  atcCode: "",
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

  return {
    accountCode: "",
    accountName: "",
    atcCode: "",
    checkDate: "",
    checkNo: "",
    checkStatus: "",
    credit: 0,
    debit: 0,
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    remarks: "",
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

export const CashVoucherBankAccounts: CashVoucherBankAccount[] = [
  {
    id: "bank-bdo-operating",
    accountCode: "1010102001",
    accountTitle: "Cash in Bank - BDO Operating",
    bankName: "BDO Unibank",
    branch: "Makati Corporate Branch",
    accountName: "Gr8Books Operating Account",
    accountNo: "1000-2201-44",
  },
  {
    id: "bank-metrobank-checking",
    accountCode: "1010102002",
    accountTitle: "Cash in Bank - Metrobank Checking",
    bankName: "Metrobank",
    branch: "BGC Finance Center",
    accountName: "Gr8Books Checking Account",
    accountNo: "0028-4511-90",
  },
  {
    id: "bank-bpi-payroll",
    accountCode: "1010102003",
    accountTitle: "Cash in Bank - BPI Payroll",
    bankName: "BPI",
    branch: "Ortigas Business Center",
    accountName: "Gr8Books Payroll Account",
    accountNo: "7781-0042-16",
  },
];

export const CashVoucherPartyOptions = [
  {
    label: "PARTY-001",
    name: "North Harbor Office Depot",
    value: "PARTY-001",
  },
  {
    label: "PARTY-002",
    name: "Metro Utilities Services",
    value: "PARTY-002",
  },
  {
    label: "PARTY-003",
    name: "Santos and Velasco Legal",
    value: "PARTY-003",
  },
  {
    label: "PARTY-004",
    name: "Global Freight Movers",
    value: "PARTY-004",
  },
  {
    label: "EMP-001",
    name: "Juan dela Cruz",
    value: "EMP-001",
  },
  {
    label: "PARTY-005",
    name: "TechPro Infrastructure",
    value: "PARTY-005",
  },
] as const;

export const CashVoucherDefaultAccounts: DefaultAccount[] = [
  {
    id: "cv-default-account-office-supplies",
    type: "EXPENSE",
    defaultAccountName: "Office Supplies",
    description: "Default expense account for office supply disbursements.",
    status: "Active",
    expenseParentCoaId: "exp-parent-office",
    generatedAccounts: [
      {
        accountCode: "5010-001",
        accountNature: "Operating Expense",
        accountTitle: "Office Supplies Expense",
        accountType: "Expenses",
        chartAccountId: "coa-exp-office-supplies",
        parentAccountId: "exp-parent-office",
        role: "EXPENSE",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "cv-default-account-professional-fees",
    type: "EXPENSE",
    defaultAccountName: "Professional Fees",
    description: "Default expense account for legal, consulting, and professional services.",
    status: "Active",
    expenseParentCoaId: "exp-parent-services",
    generatedAccounts: [
      {
        accountCode: "6080-011",
        accountNature: "Operating Expense",
        accountTitle: "Professional Fees",
        accountType: "Expenses",
        chartAccountId: "coa-exp-professional-fees",
        parentAccountId: "exp-parent-services",
        role: "EXPENSE",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "cv-default-account-travel",
    type: "EXPENSE",
    defaultAccountName: "Travel and Transportation",
    description: "Default expense account for travel, transport, and field reimbursement.",
    status: "Active",
    expenseParentCoaId: "exp-parent-travel",
    generatedAccounts: [
      {
        accountCode: "6120-004",
        accountNature: "Operating Expense",
        accountTitle: "Travel and Transportation",
        accountType: "Expenses",
        chartAccountId: "coa-exp-travel-transport",
        parentAccountId: "exp-parent-travel",
        role: "EXPENSE",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "cv-default-account-utilities",
    type: "EXPENSE",
    defaultAccountName: "Utilities",
    description: "Default expense account for utility settlements.",
    status: "Active",
    expenseParentCoaId: "exp-parent-utilities",
    generatedAccounts: [
      {
        accountCode: "6040-002",
        accountNature: "Operating Expense",
        accountTitle: "Utilities Expense",
        accountType: "Expenses",
        chartAccountId: "coa-exp-utilities",
        parentAccountId: "exp-parent-utilities",
        role: "EXPENSE",
        status: "ACTIVE",
      },
    ],
  },
];

export const CashVoucherProjectOptions = [
  {
    label: "CC-ADM-001",
    name: "Finance Operations",
    value: "Finance Operations",
  },
  {
    label: "CC-FAC-014",
    name: "Facilities",
    value: "Facilities",
  },
  {
    label: "CC-LGL-201",
    name: "Corporate Affairs",
    value: "Corporate Affairs",
  },
  {
    label: "CC-SCM-018",
    name: "Supply Chain",
    value: "Supply Chain",
  },
  {
    label: "CC-SAL-090",
    name: "Sales",
    value: "Sales",
  },
  {
    label: "CC-IT-305",
    name: "Technology",
    value: "Technology",
  },
] as const;

export const CashVoucherResponsibilityCenterOptions = [
  {
    description: "Cost Center / Administrative",
    label: "CC-ADM-001",
    name: "Finance Operations",
    value: "CC-ADM-001",
  },
  {
    description: "Cost Center / Operating",
    label: "CC-FAC-014",
    name: "Facilities",
    value: "CC-FAC-014",
  },
  {
    description: "Cost Center / Administrative",
    label: "CC-LGL-201",
    name: "Corporate Affairs",
    value: "CC-LGL-201",
  },
  {
    description: "Cost Center / Operating",
    label: "CC-SCM-018",
    name: "Supply Chain",
    value: "CC-SCM-018",
  },
  {
    description: "Cost Center / Revenue",
    label: "CC-SAL-090",
    name: "Sales",
    value: "CC-SAL-090",
  },
  {
    description: "Cost Center / Operating",
    label: "CC-IT-305",
    name: "Technology",
    value: "CC-IT-305",
  },
] as const;

export const MockCashVoucherTransactions: CashVoucherTransactionRecord[] = [
  {
    id: "cv-tx-1005",
    transactionNo: "TXN-2026-00099",
    payee: "Juan dela Cruz",
    purpose: "Field travel reimbursement for Visayas customer visits.",
    department: "Sales",
    requestedBy: "Lara Ong",
    transactionDate: "2026-04-22",
    paymentDueDate: "2026-04-29",
    amount: 3200,
    currency: "PHP",
    paymentMethod: "Cash",
    disbursementType: "Reimbursement",
    status: CashVoucherStatuses.posted,
    costCenter: "CC-SAL-090",
    createdBy: "Lara Ong",
    createdAt: "2026-04-22T09:25:00.000Z",
    updatedBy: "Angela Go",
    updatedAt: "2026-04-24T14:05:00.000Z",
  },
];

export const MockCashVouchers: CashVoucherRecord[] = [
  {
    id: "cv-2026-0099",
    transactionId: "cv-tx-1005",
    voucherNo: "CV-2026-0099",
    voucherDate: "2026-04-24",
    paymentMethod: "Cash",
    disbursementType: "Reimbursement",
    currency: "PHP",
    fxRate: "1.00",
    costCenter: "CC-SAL-090",
    partyCode: "EMP-044",
    partyName: "Juan dela Cruz",
    amount: 3200,
    taxRate: "0%",
    taxDetails: createTaxDetails(3200, "0%"),
    remarks: "Travel reimbursement for client branch roadshow.",
    referenceModule: "Cash Advance",
    voucherReferenceNo: "DVR-2026-0067",
    invoiceReferenceNo: "TRV-APR-778",
    paymentDueDate: "2026-04-29",
    paymentDetails: createEmptyPaymentDetails(),
    preparedBy: "Angela Go",
    lineEntries: [
      {
        id: "entry-1005",
        accountCode: "6150-017",
        accountName: "Travel and Transportation",
        remarks: "Field travel reimbursement",
        debit: 3200,
        credit: 0,
        taxRate: "0%",
        taxDetails: createTaxDetails(3200, "0%"),
        status: "Balanced",
      },
      {
        id: "entry-1006",
        accountCode: "1001111",
        accountName: "Cash in Hand",
        remarks: "Cash reimbursement release",
        debit: 0,
        credit: 3200,
        taxRate: "0%",
        taxDetails: createTaxDetails(3200, "0%"),
        status: "Balanced",
      },
    ],
    attachments: [],
    status: CashVoucherStatuses.posted,
    history: createInitialCashVoucherHistory({
      voucherNo: "CV-2026-0099",
      voucherDate: "2026-04-24",
      status: CashVoucherStatuses.posted,
    }),
    createdBy: "Angela Go",
    createdAt: "2026-04-24T14:05:00.000Z",
    updatedBy: "Angela Go",
    updatedAt: "2026-04-24T14:05:00.000Z",
  },
];

const LegacyMockAttachmentNames = new Set([
  "invoice-office-depot.pdf",
  "approval-memo-q2.docx",
  "retainer-billing.pdf",
  "travel-receipts.zip",
]);

export function removeLegacyMockAttachments(attachments: CashVoucherAttachment[]) {
  return attachments.filter((attachment) => !LegacyMockAttachmentNames.has(attachment.name));
}

export function sanitizeCashVoucherRecord(voucher: CashVoucherRecord): CashVoucherRecord {
  const createdAt = voucher.createdAt ?? voucher.history?.[0]?.createdAt ?? "";
  const updatedAt = voucher.updatedAt ?? voucher.history?.[voucher.history.length - 1]?.createdAt ?? createdAt;

  return {
    ...voucher,
    referenceModule: voucher.referenceModule ?? "",
    paymentDetails: normalizePaymentDetails(voucher.paymentDetails ?? createEmptyPaymentDetails()),
    attachments: removeLegacyMockAttachments(voucher.attachments),
    status: getCashVoucherDisplayStatus(voucher.status),
    history:
      voucher.history?.length > 0
        ? voucher.history.map(normalizeCashVoucherHistoryEntry)
        : createInitialCashVoucherHistory(voucher),
    createdBy: voucher.createdBy ?? voucher.preparedBy ?? "",
    createdAt,
    updatedBy: voucher.updatedBy ?? voucher.preparedBy ?? "",
    updatedAt,
  };
}

export const CashVoucherCopySources: CashVoucherCopySource[] = [
  "Accounts Payable Voucher",
  "Advances to Suppliers",
  "Cash Advance",
  "Cash Advance Liquidation",
  "Cash Advance Multiple Entry",
  "Cash Advance Multiple Entry Liquidation",
  "Petty Cash Fund",
  "Petty Cash Fund Replenishment",
  "Revolving Fund",
  "Revolving Fund Replenishment",
  "Revolving Fund Return",
  "Purchase Order",
  "Purchase Journal",
  "Receiving Report",
];

const CashVoucherCopySourceMockDefinitions: Array<{
  amount: number;
  partyCode: string;
  payee: string;
  prefix: string;
  purpose: string;
  source: CashVoucherCopySource;
}> = [
  { source: "Accounts Payable Voucher", prefix: "APV", partyCode: "PARTY-OD-204", payee: "North Harbor Office Depot", amount: 18450, purpose: "Approved supplier payable" },
  { source: "Advances to Suppliers", prefix: "ATS", partyCode: "PARTY-MUS-118", payee: "Metro Utilities Services", amount: 12500, purpose: "Supplier mobilization advance" },
  { source: "Cash Advance", prefix: "CA", partyCode: "EMP-044", payee: "Juan dela Cruz", amount: 3200, purpose: "Employee field cash advance" },
  { source: "Cash Advance Liquidation", prefix: "CAL", partyCode: "EMP-071", payee: "Maria Santos", amount: 4875, purpose: "Liquidated travel expenses" },
  { source: "Cash Advance Multiple Entry", prefix: "CAME", partyCode: "EMP-102", payee: "Jose Ramirez", amount: 8800, purpose: "Department cash advances" },
  { source: "Cash Advance Multiple Entry Liquidation", prefix: "MEL", partyCode: "EMP-117", payee: "Angela Cruz", amount: 7650, purpose: "Multiple advance liquidation" },
  { source: "Petty Cash Fund", prefix: "PCF", partyCode: "EMP-128", payee: "Arjay Capili", amount: 5000, purpose: "Petty cash fund establishment" },
  { source: "Petty Cash Fund Replenishment", prefix: "PCFR", partyCode: "EMP-136", payee: "Finance Cashier", amount: 9450, purpose: "Petty cash replenishment" },
  { source: "Revolving Fund", prefix: "RF", partyCode: "EMP-145", payee: "Operations Custodian", amount: 15000, purpose: "Revolving fund release" },
  { source: "Revolving Fund Replenishment", prefix: "RFR", partyCode: "EMP-152", payee: "Branch Cashier", amount: 11250, purpose: "Revolving fund replenishment" },
  { source: "Revolving Fund Return", prefix: "RFRET", partyCode: "EMP-166", payee: "Regional Custodian", amount: 6250, purpose: "Unused revolving fund return" },
  { source: "Purchase Order", prefix: "PO", partyCode: "PARTY-LAW-108", payee: "Santos and Velasco Legal", amount: 25000, purpose: "Approved purchase order" },
  { source: "Purchase Journal", prefix: "PJ", partyCode: "PARTY-TPI-611", payee: "TechPro Infrastructure", amount: 56000, purpose: "Posted purchase journal" },
  { source: "Receiving Report", prefix: "RR", partyCode: "PARTY-GFM-077", payee: "Global Freight Movers", amount: 13800, purpose: "Accepted receiving report" },
];

export const CashVoucherCopyFromRecords: CashVoucherCopyFromRecord[] = CashVoucherCopySourceMockDefinitions.flatMap(
  (definition, sourceIndex) =>
    Array.from({ length: 3 }, (_, recordIndex) => {
      const sequence = 41 + sourceIndex * 3 + recordIndex;
      const documentDay = String(2 + sourceIndex * 2 + recordIndex).padStart(2, "0");
      const sourceNo = `${definition.prefix}-2026-${String(sequence).padStart(4, "0")}`;
      const transaction: CashVoucherTransactionRecord = {
        ...MockCashVoucherTransactions[0],
        id: `copy-cv-transaction-${sourceIndex + 1}-${recordIndex + 1}`,
        transactionNo: `TXN-2026-CV-${String(sequence).padStart(4, "0")}`,
        payee: definition.payee,
        purpose: `${definition.purpose} batch ${recordIndex + 1}.`,
        transactionDate: `2026-07-${documentDay}`,
        paymentDueDate: `2026-08-${String(2 + sourceIndex).padStart(2, "0")}`,
        amount: definition.amount + recordIndex * 125,
      };

      return createCashVoucherCopyFromRecord(
        `copy-cv-${sourceIndex + 1}-${recordIndex + 1}`,
        definition.source,
        sourceNo,
        definition.partyCode,
        transaction,
      );
    }),
);

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
      paymentDetails: voucher.paymentDetails,
      preparedBy: voucher.preparedBy,
      status: voucher.status,
      lineEntries: ensureCashVoucherLineEntries(voucher.lineEntries),
      attachments: removeLegacyMockAttachments(voucher.attachments),
    };
  }

  return {
    taxRate: transaction ? getDefaultTaxRate(transaction) : "0%",
    taxDetails: transaction ? createDefaultTransactionTaxDetails(transaction) : createTaxDetails(0, "0%"),
    transactionId: transaction?.id ?? "",
    voucherNo: createNextVoucherNumber(),
    voucherDate: todayDateValue(),
    paymentMethod: "Cash",
    disbursementType: transaction?.disbursementType ?? "",
    currency: transaction?.currency ?? "PHP",
    fxRate: "1.00",
    costCenter: transaction?.costCenter ?? "",
    projectName: transaction?.projectName ?? transaction?.department ?? "",
    partyCode: getCashVoucherPartyCode(transaction?.payee ?? ""),
    partyName: transaction?.payee ?? "",
    amount: transaction ? createDefaultTransactionTaxDetails(transaction).amount.toFixed(2) : "",
    remarks: transaction?.purpose ?? "",
    referenceModule: "Cash Voucher",
    voucherReferenceNo: "",
    invoiceReferenceNo: "",
    paymentDueDate: transaction?.paymentDueDate ?? todayDateValue(),
    paymentDetails: createEmptyPaymentDetails(),
    preparedBy: "Finance Shared Services",
    status: CashVoucherStatuses.open,
    lineEntries: transaction
      ? ensureCashVoucherLineEntries(createAutoCashVoucherLineEntries(transaction))
      : [createBlankCashVoucherLineEntry()],
    attachments: [],
  };
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
    costCenter: values.costCenter.trim(),
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
    attachments: removeLegacyMockAttachments(values.attachments),
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
    costCenter: values.costCenter.trim(),
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
    costCenter: record.templateValues.costCenter,
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
    attachments: removeLegacyMockAttachments(record.templateValues.attachments),
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
  const attachments = records.flatMap((record) => removeLegacyMockAttachments(record.templateValues.attachments));

  return {
    ...currentValues,
    transactionId: firstRecord.transactionId,
    paymentMethod: "Cash",
    disbursementType: firstValues.disbursementType,
    currency: firstValues.currency,
    fxRate: firstValues.fxRate,
    costCenter: firstValues.costCenter,
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
      atcCode: draft.atcCode?.trim() ?? draft.taxDetails.atcCode,
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
    atcCode: taxDetails.atcCode,
    remarks: draft.remarks.trim(),
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
): CashVoucherLineEntry[] {
  const bankPaymentAccount = bankAccount ?? getMockBankAccountForPayment(transaction.paymentMethod);
  const amount = transaction.amount;
  const debitAccount = getDebitAccountTemplate(transaction);
  const creditAccount = getCreditAccountTemplate(transaction, bankPaymentAccount, paymentAccount);
  const taxProfile = getDefaultTaxProfile(transaction);
  const taxDetails = createCashVoucherTaxDetails({
    amount,
    ...taxProfile,
  });
  const creditRemarks = createCreditRemarks(transaction, bankPaymentAccount, paymentAccount);
  const refId = transaction.transactionNo || transaction.id;
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
      atcCode: "",
      remarks: transaction.purpose,
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
      accountCode: InputVatAccount.accountCode,
      accountName: InputVatAccount.accountName,
      atcCode: "",
      remarks: `Input VAT - ${transaction.purpose}`,
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
      accountCode: ExpandedWithholdingTaxAccount.accountCode,
      accountName: ExpandedWithholdingTaxAccount.accountName,
      atcCode: taxDetails.ewtCode,
      remarks: `EWT - ${transaction.purpose}`,
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
    atcCode: "",
    remarks: creditRemarks,
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
    atcCode: "",
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
    atcCode: ewtCode,
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
  if (status === CashVoucherStatuses.draft || status === CashVoucherStatuses.open) {
    return CashVoucherStatuses.draft;
  }

  if (status === "Pending Review" || status === "Pending" || status === "Active") {
    return CashVoucherStatuses.forApproval;
  }

  if (status === "Rejected") {
    return CashVoucherStatuses.disapproved;
  }

  if (status === "Completed") {
    return CashVoucherStatuses.closed;
  }

  if (status === "Approved") {
    return CashVoucherStatuses.posted;
  }

  if (
    status === CashVoucherStatuses.draft ||
    status === CashVoucherStatuses.forApproval ||
    status === CashVoucherStatuses.posted ||
    status === CashVoucherStatuses.disapproved ||
    status === CashVoucherStatuses.cancelled ||
    status === CashVoucherStatuses.closed
  ) {
    return status;
  }

  return CashVoucherStatuses.draft;
}

function createInitialCashVoucherHistory(
  voucher: Pick<CashVoucherRecord, "voucherNo" | "voucherDate" | "status">,
): CashVoucherHistoryEntry[] {
  const createdStatus =
    voucher.status === CashVoucherStatuses.draft ? CashVoucherStatuses.draft : CashVoucherStatuses.forApproval;
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
      createCashVoucherStatusHistoryEntry(
        voucher.status,
        voucher.voucherNo,
        createCashVoucherHistoryDate(voucher.voucherDate, 9),
      ),
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
  if (status === CashVoucherStatuses.posted) {
    return CashVoucherStatuses.posted;
  }

  if (status === CashVoucherStatuses.disapproved) {
    return CashVoucherStatuses.disapproved;
  }

  if (status === CashVoucherStatuses.cancelled) {
    return CashVoucherStatuses.cancelled;
  }

  if (status === CashVoucherStatuses.closed) {
    return CashVoucherStatuses.closed;
  }

  if (status === CashVoucherStatuses.forApproval) {
    return CashVoucherStatuses.forApproval;
  }

  return "Updated";
}

function getCashVoucherHistoryDescription(status: CashVoucherStatus, voucherNo: string) {
  if (status === CashVoucherStatuses.posted) {
    return `${voucherNo} was posted for disbursement processing.`;
  }

  if (status === CashVoucherStatuses.disapproved) {
    return `${voucherNo} was disapproved and returned for review.`;
  }

  if (status === CashVoucherStatuses.cancelled) {
    return `${voucherNo} was cancelled.`;
  }

  if (status === CashVoucherStatuses.closed) {
    return `${voucherNo} was closed.`;
  }

  if (status === CashVoucherStatuses.draft) {
    return `${voucherNo} was restored to Draft.`;
  }

  return `${voucherNo} was returned for approval.`;
}

export function isCashVoucherForApprovalStatus(status: string) {
  const displayStatus = getCashVoucherDisplayStatus(status);

  return displayStatus === CashVoucherStatuses.forApproval;
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function createNextVoucherNumber() {
  const currentYear = new Date().getFullYear();
  const matchingSerials = MockCashVouchers.map((voucher) => {
    const matchedParts = voucher.voucherNo.match(/^CV-(\d{4})-(\d{4})$/);

    if (!matchedParts) {
      return null;
    }

    const [, year, serial] = matchedParts;

    return Number(year) === currentYear ? Number(serial) : null;
  }).filter((value): value is number => value !== null);
  const nextSerial = Math.max(0, ...matchingSerials) + 1;
  const serial = String(nextSerial).padStart(4, "0");

  return `CV-${currentYear}-${serial}`;
}

function createNextTransactionNumber() {
  const currentYear = new Date().getFullYear();
  const serial = String(Date.now() % 100000).padStart(5, "0");

  return `TXN-${currentYear}-${serial}`;
}

function createCashVoucherCopyFromRecord(
  id: string,
  source: CashVoucherCopySource,
  sourceNo: string,
  partyCode: string,
  transaction: CashVoucherTransactionRecord,
  voucher?: CashVoucherRecord,
): CashVoucherCopyFromRecord {
  const templateValues = createCashVoucherFormValues(transaction, voucher);

  return {
    id,
    source,
    sourceNo,
    documentDate: voucher?.voucherDate ?? transaction.transactionDate,
    transactionId: transaction.id,
    partyCode,
    partyName: transaction.payee,
    amount: templateValues.amount,
    remarks: voucher?.remarks ?? transaction.purpose,
    templateValues: {
      ...templateValues,
      partyCode: voucher?.partyCode ?? partyCode,
      partyName: voucher?.partyName ?? transaction.payee,
      remarks: voucher?.remarks ?? `${transaction.purpose} Copied from ${sourceNo}.`,
      referenceModule: voucher?.referenceModule ?? source,
      invoiceReferenceNo: voucher?.invoiceReferenceNo ?? `${sourceNo}-REF`,
      attachments: voucher?.attachments ?? createAttachmentPlaceholders(),
      lineEntries: voucher?.lineEntries ?? createAutoCashVoucherLineEntries(transaction),
    },
  };
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
) {
  if (bankAccount) {
    return {
      accountCode: bankAccount.accountCode,
      accountName: bankAccount.accountTitle,
    };
  }

  if (paymentAccount?.type === "Cash") {
    return {
      ...CashInHandAccount,
    };
  }

  if (transaction.paymentMethod === "Cash") {
    return {
      ...CashInHandAccount,
    };
  }

  return createDefaultCashInBankCreditAccount();
}

function getMockBankAccountForPayment(paymentMethod: CashVoucherPaymentMethod) {
  if (paymentMethod === "Cash") {
    return null;
  }

  if (paymentMethod === "Check" || paymentMethod === "Manager's Check") {
    return CashVoucherBankAccounts[1] ?? CashVoucherBankAccounts[0] ?? null;
  }

  return CashVoucherBankAccounts[0] ?? null;
}

function createDefaultCashInBankCreditAccount() {
  const bankAccount = CashVoucherBankAccounts[0];

  return {
    accountCode: bankAccount?.accountCode ?? "1010-001",
    accountName: bankAccount?.accountTitle ?? "Cash in Bank",
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

function getDefaultTaxRate(transaction: CashVoucherTransactionRecord) {
  const taxProfile = getDefaultTaxProfile(transaction);

  return taxProfile.vatPercent > 0 ? `${taxProfile.vatPercent}%` : "0%";
}

function createDefaultTransactionTaxDetails(transaction: CashVoucherTransactionRecord) {
  return createCashVoucherTaxDetails({
    amount: transaction.amount,
    ...getDefaultTaxProfile(transaction),
  });
}

function getDefaultTaxProfile(transaction: CashVoucherTransactionRecord) {
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

function parseTaxPercent(taxRate: string) {
  const numericPortion = Number.parseFloat(taxRate.replace(/[^0-9.]/g, ""));

  return Number.isFinite(numericPortion) ? numericPortion : 0;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
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
  return CashVoucherPartyOptions.find((option) => option.name.toLowerCase() === partyName.trim().toLowerCase())?.value ?? "";
}


