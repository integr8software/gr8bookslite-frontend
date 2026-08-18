import type {
  DisbursementAttachment,
  DisbursementPaymentMethod,
  DisbursementVoucherBankAccount,
  DisbursementVoucherPaymentAccount,
  DisbursementVoucherCopyFromRecord,
  DisbursementVoucherCopySource,
  DisbursementLineEntry,
  DisbursementVoucherPaymentDetails,
  DisbursementVoucherStatus,
  DisbursementVoucherDisplayStatus,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormValues,
  DisbursementVoucherHistoryEntry,
  DisbursementVoucherRecord,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  DisbursementVoucherRecordStorageKey,
  DisbursementVoucherStatuses,
  DisbursementVoucherTransactionStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
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

export function getSeedDisbursementTransactions() {
  return MockDisbursementTransactions.map((transaction) => ({
    ...transaction,
    status: getDisbursementVoucherDisplayStatus(transaction.status),
  }));
}

export function getSeedDisbursementVouchers() {
  return MockDisbursementVouchers.map(sanitizeDisbursementVoucherRecord);
}

export function readStoredDisbursementTransactions() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTransactions = window.localStorage.getItem(DisbursementVoucherTransactionStorageKey);

  if (!storedTransactions) {
    return null;
  }

  try {
    const parsedTransactions = JSON.parse(storedTransactions) as DisbursementTransactionRecord[];

    return Array.isArray(parsedTransactions)
      ? parsedTransactions.map((transaction) => ({
          ...transaction,
          status: getDisbursementVoucherDisplayStatus(transaction.status),
        }))
      : null;
  } catch {
    return null;
  }
}

export function readStoredDisbursementVouchers() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedVouchers = window.localStorage.getItem(DisbursementVoucherRecordStorageKey);

  if (!storedVouchers) {
    return null;
  }

  try {
    const parsedVouchers = JSON.parse(storedVouchers) as DisbursementVoucherRecord[];

    if (!Array.isArray(parsedVouchers)) {
      return null;
    }

    return parsedVouchers.map(sanitizeDisbursementVoucherRecord);
  } catch {
    return null;
  }
}

export function writeStoredDisbursementTransactions(transactions: DisbursementTransactionRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DisbursementVoucherTransactionStorageKey, JSON.stringify(transactions));
}

export function writeStoredDisbursementVouchers(vouchers: DisbursementVoucherRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DisbursementVoucherRecordStorageKey, JSON.stringify(vouchers.map(sanitizeDisbursementVoucherRecord)));
}

export const DisbursementVoucherInitialEntryDraft: DisbursementVoucherEntryDraft = {
  accountCode: "",
  accountName: "",
  atcCode: "",
  particulars: "",
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
    particulars: "",
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

export function ensureDisbursementLineEntries(entries: DisbursementLineEntry[]) {
  return entries.length > 0 ? entries : [createBlankDisbursementLineEntry()];
}

export const DisbursementVoucherBankAccounts: DisbursementVoucherBankAccount[] = [
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

export const DisbursementVoucherPartyOptions = [
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

export const DisbursementVoucherDefaultAccounts: DefaultAccount[] = [
  {
    id: "dv-default-account-office-supplies",
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
    id: "dv-default-account-professional-fees",
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
    id: "dv-default-account-travel",
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
    id: "dv-default-account-utilities",
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

export const DisbursementVoucherProjectOptions = [
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

export const DisbursementVoucherResponsibilityCenterOptions = [
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

export const MockDisbursementTransactions: DisbursementTransactionRecord[] = [
  {
    id: "dv-tx-1001",
    transactionNo: "TXN-2026-00103",
    payee: "North Harbor Office Depot",
    purpose: "Quarter-end office supplies replenishment for shared admin pool.",
    department: "Finance Operations",
    requestedBy: "Maria Dizon",
    transactionDate: "2026-05-14",
    paymentDueDate: "2026-05-21",
    amount: 18450,
    currency: "PHP",
    paymentMethod: "Bank Transfer",
    disbursementType: "Vendor Payment",
    status: DisbursementVoucherStatuses.draft,
    costCenter: "CC-ADM-001",
    createdBy: "Maria Dizon",
    createdAt: "2026-05-14T08:15:00.000Z",
    updatedBy: "Marvin Torres",
    updatedAt: "2026-05-18T09:30:00.000Z",
  },
  {
    id: "dv-tx-1002",
    transactionNo: "TXN-2026-00102",
    payee: "Metro Utilities Services",
    purpose: "May electricity and water dues for the Makati branch office.",
    department: "Facilities",
    requestedBy: "Jasper Co",
    transactionDate: "2026-05-10",
    paymentDueDate: "2026-05-23",
    amount: 8320.5,
    currency: "PHP",
    paymentMethod: "InstaPay",
    disbursementType: "Operating Expense",
    status: DisbursementVoucherStatuses.cancelled,
    costCenter: "CC-FAC-014",
    createdBy: "Jasper Co",
    createdAt: "2026-05-10T10:05:00.000Z",
    updatedBy: "Jasper Co",
    updatedAt: "2026-05-10T10:05:00.000Z",
  },
  {
    id: "dv-tx-1003",
    transactionNo: "TXN-2026-00101",
    payee: "Santos and Velasco Legal",
    purpose: "Retainer fee for corporate filing and contract review support.",
    department: "Corporate Affairs",
    requestedBy: "Patricia Cruz",
    transactionDate: "2026-05-03",
    paymentDueDate: "2026-05-17",
    amount: 25000,
    currency: "PHP",
    paymentMethod: "Check",
    disbursementType: "Operating Expense",
    status: DisbursementVoucherStatuses.posted,
    costCenter: "CC-LGL-201",
    createdBy: "Patricia Cruz",
    createdAt: "2026-05-03T13:20:00.000Z",
    updatedBy: "Clarisse Yap",
    updatedAt: "2026-05-05T15:45:00.000Z",
  },
  {
    id: "dv-tx-1004",
    transactionNo: "TXN-2026-00100",
    payee: "Global Freight Movers",
    purpose: "Backhaul logistics expense for April inter-branch transfers.",
    department: "Supply Chain",
    requestedBy: "Eugene Ramirez",
    transactionDate: "2026-04-28",
    paymentDueDate: "2026-05-06",
    amount: 4875,
    currency: "PHP",
    paymentMethod: "Bank Transfer",
    disbursementType: "Vendor Payment",
    status: DisbursementVoucherStatuses.disapproved,
    costCenter: "CC-SCM-018",
    createdBy: "Eugene Ramirez",
    createdAt: "2026-04-28T11:45:00.000Z",
    updatedBy: "Finance Reviewer",
    updatedAt: "2026-04-29T16:10:00.000Z",
  },
  {
    id: "dv-tx-1005",
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
    status: DisbursementVoucherStatuses.posted,
    costCenter: "CC-SAL-090",
    createdBy: "Lara Ong",
    createdAt: "2026-04-22T09:25:00.000Z",
    updatedBy: "Angela Go",
    updatedAt: "2026-04-24T14:05:00.000Z",
  },
  {
    id: "dv-tx-1006",
    transactionNo: "TXN-2026-00098",
    payee: "TechPro Infrastructure",
    purpose: "Shared server rack upgrade and switch replacement for IT core.",
    department: "Technology",
    requestedBy: "Ivan Flores",
    transactionDate: "2026-04-15",
    paymentDueDate: "2026-04-30",
    amount: 56000,
    currency: "PHP",
    paymentMethod: "Bank Transfer",
    disbursementType: "Capital Expenditure",
    status: DisbursementVoucherStatuses.draft,
    costCenter: "CC-IT-305",
    createdBy: "Ivan Flores",
    createdAt: "2026-04-15T10:30:00.000Z",
    updatedBy: "Ivan Flores",
    updatedAt: "2026-04-15T10:30:00.000Z",
  },
];

export const MockDisbursementVouchers: DisbursementVoucherRecord[] = [
  {
    id: "dv-2026-0104",
    transactionId: "dv-tx-1001",
    voucherNo: "DV-2026-0104",
    voucherDate: "2026-05-18",
    paymentMethod: "Bank Transfer",
    disbursementType: "Vendor Payment",
    currency: "PHP",
    fxRate: "1.00",
    costCenter: "CC-ADM-001",
    partyCode: "PARTY-OD-204",
    partyName: "North Harbor Office Depot",
    amount: 18450,
    taxRate: "0%",
    taxDetails: createTaxDetails(18450, "0%"),
    remarks: "Rush replenishment approved for Q2 workspace consumables.",
    referenceModule: "Account Payable Voucher",
    voucherReferenceNo: "DVR-2026-0094",
    invoiceReferenceNo: "INV-OFF-5521",
    paymentDueDate: "2026-05-21",
    paymentDetails: {
      bankAccountCode: "1010102001",
      bankAccountName: "North Harbor Office Depot",
      bankAccountNo: "1000-2201-44",
      bankAccountTitle: "Cash in Bank - BDO Operating",
      bankBranch: "Makati Corporate Branch",
      bankName: "BDO Unibank",
      checkDate: "",
      checkNo: "",
      paymentReferenceNo: "BT-2026-0518-094",
    },
    preparedBy: "Marvin Torres",
    lineEntries: [
      {
        id: "entry-1001",
        accountCode: "5010-001",
        accountName: "Office Supplies Expense",
        particulars: "Replenishment of paper, toner, and pantry labels",
        debit: 18450,
        credit: 0,
        taxRate: "0%",
        taxDetails: createTaxDetails(18450, "0%"),
        status: "Balanced",
      },
      {
        id: "entry-1002",
        accountCode: "1010102001",
        accountName: "Cash in Bank - BDO Operating",
        particulars: "Settlement via BDO operating bank account",
        debit: 0,
        credit: 18450,
        taxRate: "0%",
        taxDetails: createTaxDetails(18450, "0%"),
        status: "Balanced",
      },
    ],
    attachments: [],
    status: DisbursementVoucherStatuses.forApproval,
    history: createInitialDisbursementVoucherHistory({
      voucherNo: "DV-2026-0104",
      voucherDate: "2026-05-18",
      status: DisbursementVoucherStatuses.forApproval,
    }),
    createdBy: "Marvin Torres",
    createdAt: "2026-05-18T09:30:00.000Z",
    updatedBy: "Marvin Torres",
    updatedAt: "2026-05-18T09:30:00.000Z",
  },
  {
    id: "dv-2026-0101",
    transactionId: "dv-tx-1003",
    voucherNo: "DV-2026-0101",
    voucherDate: "2026-05-05",
    paymentMethod: "Check",
    disbursementType: "Operating Expense",
    currency: "PHP",
    fxRate: "1.00",
    costCenter: "CC-LGL-201",
    partyCode: "PARTY-LAW-108",
    partyName: "Santos and Velasco Legal",
    amount: 22500,
    taxRate: "12%",
    taxDetails: createDisbursementTaxDetails({
      amount: 25000,
      ewtCode: "W10",
      ewtPercent: 10,
      vatCode: "V12",
      vatPercent: 12,
    }),
    remarks: "Monthly legal retainer for regulatory and contract support.",
    referenceModule: "Purchase Order",
    voucherReferenceNo: "DVR-2026-0081",
    invoiceReferenceNo: "RET-0503-24",
    paymentDueDate: "2026-05-17",
    paymentDetails: {
      bankAccountCode: "1010102002",
      bankAccountName: "Santos and Velasco Legal",
      bankAccountNo: "0028-4511-90",
      bankAccountTitle: "Cash in Bank - Metrobank Checking",
      bankBranch: "BGC Finance Center",
      bankName: "Metrobank",
      checkDate: "2026-05-05",
      checkNo: "CHK-009812",
      paymentReferenceNo: "",
    },
    preparedBy: "Clarisse Yap",
    lineEntries: [
      {
        id: "entry-1003",
        accountCode: "6080-011",
        accountName: "Professional Fees",
        particulars: "Corporate legal retainer for May",
        debit: 22000,
        credit: 0,
        taxRate: "12%",
        taxDetails: createDisbursementTaxDetails({
          amount: 25000,
          ewtCode: "W10",
          ewtPercent: 10,
          vatCode: "V12",
          vatPercent: 12,
        }),
        status: "Balanced",
      },
      {
        id: "entry-1004-vat",
        accountCode: "2010002011",
        accountName: "Input VAT",
        particulars: "Input VAT - Corporate legal retainer for May",
        debit: 3000,
        credit: 0,
        taxRate: "0%",
        taxDetails: createTaxDetails(3000, "0%"),
        vatType: "Input VAT",
        status: "Balanced",
      },
      {
        id: "entry-1004-ewt",
        accountCode: "2010002002",
        accountName: "Expanded Withholding Tax",
        particulars: "EWT - Corporate legal retainer for May",
        debit: 0,
        credit: 2500,
        taxRate: "0%",
        taxDetails: createTaxDetails(2500, "0%"),
        atcCode: "W10",
        vatType: "EWT",
        status: "Balanced",
      },
      {
        id: "entry-1004",
        accountCode: "1010102002",
        accountName: "Cash in Bank - Metrobank Checking",
        particulars: "Release of legal retainer through Metrobank checking account",
        debit: 0,
        credit: 22500,
        taxRate: "0%",
        taxDetails: createTaxDetails(22500, "0%"),
        status: "Balanced",
      },
    ],
    attachments: [],
    status: DisbursementVoucherStatuses.posted,
    history: createInitialDisbursementVoucherHistory({
      voucherNo: "DV-2026-0101",
      voucherDate: "2026-05-05",
      status: DisbursementVoucherStatuses.posted,
    }),
    createdBy: "Clarisse Yap",
    createdAt: "2026-05-05T15:45:00.000Z",
    updatedBy: "Clarisse Yap",
    updatedAt: "2026-05-05T15:45:00.000Z",
  },
  {
    id: "dv-2026-0099",
    transactionId: "dv-tx-1005",
    voucherNo: "DV-2026-0099",
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
        particulars: "Field travel reimbursement",
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
        particulars: "Cash reimbursement release",
        debit: 0,
        credit: 3200,
        taxRate: "0%",
        taxDetails: createTaxDetails(3200, "0%"),
        status: "Balanced",
      },
    ],
    attachments: [],
    status: DisbursementVoucherStatuses.posted,
    history: createInitialDisbursementVoucherHistory({
      voucherNo: "DV-2026-0099",
      voucherDate: "2026-04-24",
      status: DisbursementVoucherStatuses.posted,
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

export function removeLegacyMockAttachments(attachments: DisbursementAttachment[]) {
  return attachments.filter((attachment) => !LegacyMockAttachmentNames.has(attachment.name));
}

export function sanitizeDisbursementVoucherRecord(voucher: DisbursementVoucherRecord): DisbursementVoucherRecord {
  const createdAt = voucher.createdAt ?? voucher.history?.[0]?.createdAt ?? "";
  const updatedAt = voucher.updatedAt ?? voucher.history?.[voucher.history.length - 1]?.createdAt ?? createdAt;

  return {
    ...voucher,
    referenceModule: voucher.referenceModule ?? "",
    paymentDetails: normalizePaymentDetails(voucher.paymentDetails ?? createEmptyPaymentDetails()),
    attachments: removeLegacyMockAttachments(voucher.attachments),
    status: getDisbursementVoucherDisplayStatus(voucher.status),
    history:
      voucher.history?.length > 0
        ? voucher.history.map(normalizeDisbursementVoucherHistoryEntry)
        : createInitialDisbursementVoucherHistory(voucher),
    createdBy: voucher.createdBy ?? voucher.preparedBy ?? "",
    createdAt,
    updatedBy: voucher.updatedBy ?? voucher.preparedBy ?? "",
    updatedAt,
  };
}

export const DisbursementVoucherCopySources: DisbursementVoucherCopySource[] = [
  "Account Payable Voucher",
  "Advances to Suppliers",
  "Cash Advance",
  "Cash Advance Liquidation",
  "Cash Advance ",
  "Cash Advance Multiple Entry",
  "Revolving Fund",
  "Revolving Fund Replenishment",
  "Purchase Order",
  "Purchase Journal",
  "Receiving Report",
];

export const DisbursementVoucherCopyFromRecords: DisbursementVoucherCopyFromRecord[] = [
  createDisbursementVoucherCopyFromRecord(
    "copy-dv-1001",
    "Account Payable Voucher",
    "APV-2026-0041",
    "PARTY-OD-204",
    MockDisbursementTransactions[0],
    MockDisbursementVouchers[0],
  ),
  createDisbursementVoucherCopyFromRecord(
    "copy-dv-1002",
    "Advances to Suppliers",
    "ATS-2026-0017",
    "PARTY-MUS-118",
    MockDisbursementTransactions[1],
  ),
  createDisbursementVoucherCopyFromRecord(
    "copy-dv-1003",
    "Cash Advance",
    "CA-2026-0021",
    "EMP-044",
    MockDisbursementTransactions[4],
    MockDisbursementVouchers[2],
  ),
  createDisbursementVoucherCopyFromRecord(
    "copy-dv-1004",
    "Cash Advance Multiple Entry",
    "CAME-2026-0015",
    "EMP-044",
    MockDisbursementTransactions[4],
  ),
  createDisbursementVoucherCopyFromRecord("copy-dv-1005", "Revolving Fund", "RF-2026-0007", "EMP-044", MockDisbursementTransactions[4]),
  createDisbursementVoucherCopyFromRecord(
    "copy-dv-1007",
    "Revolving Fund Replenishment",
    "PCFR-2026-0012",
    "PARTY-TPI-611",
    MockDisbursementTransactions[5],
  ),
  createDisbursementVoucherCopyFromRecord(
    "copy-dv-1008",
    "Purchase Order",
    "PO-2026-0322",
    "PARTY-LAW-108",
    MockDisbursementTransactions[2],
    MockDisbursementVouchers[1],
  ),
  createDisbursementVoucherCopyFromRecord(
    "copy-dv-1009",
    "Purchase Journal",
    "PJ-2026-0088",
    "PARTY-MUS-118",
    MockDisbursementTransactions[1],
  ),
  createDisbursementVoucherCopyFromRecord(
    "copy-dv-1010",
    "Receiving Report",
    "RR-2026-0144",
    "PARTY-GFM-077",
    MockDisbursementTransactions[3],
  ),
];

export function buildDisbursementVoucherPreviewRows(transactions: DisbursementTransactionRecord[], vouchers: DisbursementVoucherRecord[]) {
  const voucherByTransactionId = new Map(vouchers.map((voucher) => [voucher.transactionId, voucher]));

  return transactions.map((transaction) => ({
    transaction,
    voucher: voucherByTransactionId.get(transaction.id),
  }));
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
      paymentDetails: voucher.paymentDetails,
      preparedBy: voucher.preparedBy,
      status: voucher.status,
      lineEntries: ensureDisbursementLineEntries(voucher.lineEntries),
      attachments: removeLegacyMockAttachments(voucher.attachments),
    };
  }

  return {
    taxRate: transaction ? getDefaultTaxRate(transaction) : "0%",
    taxDetails: transaction ? createDefaultTransactionTaxDetails(transaction) : createTaxDetails(0, "0%"),
    transactionId: transaction?.id ?? "",
    voucherNo: createNextVoucherNumber(),
    voucherDate: todayDateValue(),
    paymentMethod: transaction?.paymentMethod ?? "",
    disbursementType: transaction?.disbursementType ?? "",
    currency: transaction?.currency ?? "PHP",
    fxRate: "1.00",
    costCenter: transaction?.costCenter ?? "",
    projectName: transaction?.projectName ?? transaction?.department ?? "",
    partyCode: getDisbursementVoucherPartyCode(transaction?.payee ?? ""),
    partyName: transaction?.payee ?? "",
    amount: transaction ? createDefaultTransactionTaxDetails(transaction).amount.toFixed(2) : "",
    remarks: transaction?.purpose ?? "",
    referenceModule: "Disbursement Voucher",
    voucherReferenceNo: "",
    invoiceReferenceNo: "",
    paymentDueDate: transaction?.paymentDueDate ?? todayDateValue(),
    paymentDetails: createEmptyPaymentDetails(),
    preparedBy: "Finance Shared Services",
    status: DisbursementVoucherStatuses.open,
    lineEntries: transaction
      ? ensureDisbursementLineEntries(createAutoDisbursementLineEntries(transaction))
      : [createBlankDisbursementLineEntry()],
    attachments: [],
  };
}

export function createDisbursementVoucherFromForm(values: DisbursementVoucherFormValues): DisbursementVoucherRecord {
  const now = new Date().toISOString();
  const actor = values.preparedBy.trim() || "Current User";

  return {
    id: `dv-${Date.now()}`,
    transactionId: values.transactionId,
    voucherNo: values.voucherNo.trim(),
    voucherDate: values.voucherDate,
    paymentMethod: values.paymentMethod as DisbursementVoucherRecord["paymentMethod"],
    disbursementType: values.disbursementType as DisbursementVoucherRecord["disbursementType"],
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
    lineEntries: ensureDisbursementLineEntries(values.lineEntries),
    attachments: removeLegacyMockAttachments(values.attachments),
    history: createInitialDisbursementVoucherHistory({
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

export function createDisbursementTransactionFromForm(
  values: DisbursementVoucherFormValues,
  transaction?: DisbursementTransactionRecord,
): DisbursementTransactionRecord {
  const now = new Date().toISOString();
  const actor = values.preparedBy.trim() || "Finance Shared Services";

  return {
    id: transaction?.id ?? values.transactionId,
    transactionNo: transaction?.transactionNo ?? (values.transactionId.trim() || createNextTransactionNumber()),
    payee: values.partyName.trim() || transaction?.payee || "Unnamed Payee",
    purpose: values.remarks.trim() || transaction?.purpose || "Disbursement voucher",
    department: values.projectName.trim() || transaction?.department || "Finance Operations",
    projectName: values.projectName.trim(),
    requestedBy: transaction?.requestedBy ?? (values.preparedBy.trim() || "Finance Shared Services"),
    transactionDate: transaction?.transactionDate ?? values.voucherDate,
    paymentDueDate: values.paymentDueDate,
    amount: parseMoneyNumberInput(values.amount),
    currency: values.currency,
    paymentMethod: values.paymentMethod as DisbursementTransactionRecord["paymentMethod"],
    disbursementType: values.disbursementType as DisbursementTransactionRecord["disbursementType"],
    status: values.status,
    costCenter: values.costCenter.trim(),
    accountingEntries: ensureDisbursementLineEntries(values.lineEntries),
    createdBy: transaction?.createdBy ?? actor,
    createdAt: transaction?.createdAt ?? now,
    updatedBy: actor,
    updatedAt: now,
  };
}

export function applyCopyFromRecordToDisbursementVoucherForm(
  currentValues: DisbursementVoucherFormValues,
  record: DisbursementVoucherCopyFromRecord,
) {
  return {
    ...currentValues,
    transactionId: record.transactionId,
    paymentMethod: record.templateValues.paymentMethod,
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
    lineEntries: ensureDisbursementLineEntries(record.templateValues.lineEntries),
    attachments: removeLegacyMockAttachments(record.templateValues.attachments),
  };
}

export function applyCopyFromRecordsToDisbursementVoucherForm(
  currentValues: DisbursementVoucherFormValues,
  records: DisbursementVoucherCopyFromRecord[],
) {
  if (records.length === 0) {
    return currentValues;
  }

  const firstRecord = records[0];
  if (!firstRecord) {
    return currentValues;
  }

  if (records.length === 1) {
    return applyCopyFromRecordToDisbursementVoucherForm(currentValues, firstRecord);
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
    paymentMethod: firstValues.paymentMethod,
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
    lineEntries: ensureDisbursementLineEntries(lineEntries),
    attachments,
  };
}

export function updateDisbursementVoucherFromForm(voucher: DisbursementVoucherRecord, values: DisbursementVoucherFormValues) {
  const updatedVoucher = createDisbursementVoucherFromForm(values);
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

export function createDisbursementVoucherStatusHistoryEntry(
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

export function createDisbursementLineEntry(draft: DisbursementVoucherEntryDraft): DisbursementLineEntry {
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
    particulars: draft.particulars.trim(),
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
  paymentAccount?: DisbursementVoucherPaymentAccount | null,
): DisbursementLineEntry[] {
  const bankPaymentAccount = bankAccount ?? getMockBankAccountForPayment(transaction.paymentMethod);
  const amount = transaction.amount;
  const debitAccount = getDebitAccountTemplate(transaction);
  const creditAccount = getCreditAccountTemplate(transaction, bankPaymentAccount, paymentAccount);
  const taxProfile = getDefaultTaxProfile(transaction);
  const taxDetails = createDisbursementTaxDetails({
    amount,
    ...taxProfile,
  });
  const creditParticulars = createCreditParticulars(transaction, bankPaymentAccount, paymentAccount);
  const refId = transaction.transactionNo || transaction.id;
  const commonFields = {
    partyCode: getDisbursementVoucherPartyCode(transaction.payee),
    partyName: transaction.payee,
    refId,
    responsibilityCenter: transaction.costCenter,
  };
  const entries: DisbursementLineEntry[] = [
    {
      id: `auto-expense-${transaction.id}`,
      accountCode: debitAccount.accountCode,
      accountName: debitAccount.accountName,
      atcCode: "",
      particulars: transaction.purpose,
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
      particulars: `Input VAT - ${transaction.purpose}`,
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
      particulars: `EWT - ${transaction.purpose}`,
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
    particulars: creditParticulars,
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
    bankAccountTitle: bankAccount.accountTitle,
    bankAccountName: bankAccount.accountName,
    bankAccountNo: bankAccount.accountNo,
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
          particulars: createCreditParticulars(undefined, bankAccount, paymentAccount),
        }
      : entry,
  );
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

export function createTaxDetails(amount: number, taxRate: string): DisbursementTaxDetails {
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

function createDisbursementVoucherHistoryDate(voucherDate: string, hour: number) {
  const date = voucherDate || new Date().toISOString().slice(0, 10);

  return `${date}T${hour.toString().padStart(2, "0")}:00:00.000Z`;
}

function getDisbursementVoucherHistoryAction(status: DisbursementVoucherStatus) {
  if (status === DisbursementVoucherStatuses.posted) {
    return DisbursementVoucherStatuses.posted;
  }

  if (status === DisbursementVoucherStatuses.disapproved) {
    return DisbursementVoucherStatuses.disapproved;
  }

  if (status === DisbursementVoucherStatuses.cancelled) {
    return DisbursementVoucherStatuses.cancelled;
  }

  if (status === DisbursementVoucherStatuses.closed) {
    return DisbursementVoucherStatuses.closed;
  }

  if (status === DisbursementVoucherStatuses.forApproval) {
    return DisbursementVoucherStatuses.forApproval;
  }

  return "Updated";
}

function getDisbursementVoucherHistoryDescription(status: DisbursementVoucherStatus, voucherNo: string) {
  if (status === DisbursementVoucherStatuses.posted) {
    return `${voucherNo} was posted for disbursement processing.`;
  }

  if (status === DisbursementVoucherStatuses.disapproved) {
    return `${voucherNo} was disapproved and returned for review.`;
  }

  if (status === DisbursementVoucherStatuses.cancelled) {
    return `${voucherNo} was cancelled.`;
  }

  if (status === DisbursementVoucherStatuses.closed) {
    return `${voucherNo} was closed.`;
  }

  if (status === DisbursementVoucherStatuses.draft) {
    return `${voucherNo} was restored to Draft.`;
  }

  return `${voucherNo} was returned for approval.`;
}

export function isDisbursementVoucherForApprovalStatus(status: string) {
  const displayStatus = getDisbursementVoucherDisplayStatus(status);

  return displayStatus === DisbursementVoucherStatuses.forApproval;
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function createNextVoucherNumber() {
  const currentYear = new Date().getFullYear();
  const matchingSerials = MockDisbursementVouchers.map((voucher) => {
    const matchedParts = voucher.voucherNo.match(/^DV-(\d{4})-(\d{4})$/);

    if (!matchedParts) {
      return null;
    }

    const [, year, serial] = matchedParts;

    return Number(year) === currentYear ? Number(serial) : null;
  }).filter((value): value is number => value !== null);
  const nextSerial = Math.max(0, ...matchingSerials) + 1;
  const serial = String(nextSerial).padStart(4, "0");

  return `DV-${currentYear}-${serial}`;
}

function createNextTransactionNumber() {
  const currentYear = new Date().getFullYear();
  const serial = String(Date.now() % 100000).padStart(5, "0");

  return `TXN-${currentYear}-${serial}`;
}

function createDisbursementVoucherCopyFromRecord(
  id: string,
  source: DisbursementVoucherCopySource,
  sourceNo: string,
  partyCode: string,
  transaction: DisbursementTransactionRecord,
  voucher?: DisbursementVoucherRecord,
): DisbursementVoucherCopyFromRecord {
  const templateValues = createDisbursementVoucherFormValues(transaction, voucher);

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
      lineEntries: voucher?.lineEntries ?? createAutoDisbursementLineEntries(transaction),
    },
  };
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
  paymentAccount?: DisbursementVoucherPaymentAccount | null,
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

function getMockBankAccountForPayment(paymentMethod: DisbursementPaymentMethod) {
  if (paymentMethod === "Cash") {
    return null;
  }

  if (paymentMethod === "Check" || paymentMethod === "Manager's Check") {
    return DisbursementVoucherBankAccounts[1] ?? DisbursementVoucherBankAccounts[0] ?? null;
  }

  return DisbursementVoucherBankAccounts[0] ?? null;
}

function createDefaultCashInBankCreditAccount() {
  const bankAccount = DisbursementVoucherBankAccounts[0];

  return {
    accountCode: bankAccount?.accountCode ?? "1010-001",
    accountName: bankAccount?.accountTitle ?? "Cash in Bank",
  };
}

function createCreditParticulars(
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

function parseTaxPercent(taxRate: string) {
  const numericPortion = Number.parseFloat(taxRate.replace(/[^0-9.]/g, ""));

  return Number.isFinite(numericPortion) ? numericPortion : 0;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function createEmptyPaymentDetails(): DisbursementVoucherPaymentDetails {
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

function getDisbursementVoucherPartyCode(partyName: string) {
  return DisbursementVoucherPartyOptions.find((option) => option.name.toLowerCase() === partyName.trim().toLowerCase())?.value ?? "";
}
