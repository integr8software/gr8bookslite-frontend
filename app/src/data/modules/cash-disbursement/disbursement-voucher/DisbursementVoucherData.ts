import type {
  DisbursementAttachment,
  DisbursementVoucherBankAccount,
  DisbursementVoucherPaymentAccount,
  DisbursementVoucherCopyFromRecord,
  DisbursementVoucherCopySource,
  DisbursementLineEntry,
  DisbursementVoucherPaymentDetails,
  DisbursementVoucherStatus,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormValues,
  DisbursementVoucherHistoryEntry,
  DisbursementVoucherRecord,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

export type DisbursementVoucherDisplayStatus = DisbursementVoucherStatus;

export const DisbursementVoucherInitialEntryDraft: DisbursementVoucherEntryDraft =
  {
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

export function createBlankDisbursementLineEntry(
  overrides: Partial<DisbursementLineEntry> = {},
): DisbursementLineEntry {
  const refId = overrides.refId ?? "";
  const responsibilityCenter = overrides.responsibilityCenter ?? "";

  return {
    accountCode: "",
    accountName: "",
    atcCode: "",
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

export function ensureDisbursementLineEntries(
  entries: DisbursementLineEntry[],
) {
  return entries.length > 0 ? entries : [createBlankDisbursementLineEntry()];
}

export const DisbursementVoucherBankAccounts: DisbursementVoucherBankAccount[] =
  [
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
    status: "Active",
    costCenter: "CC-ADM-001",
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
    status: "Active",
    costCenter: "CC-FAC-014",
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
    status: "Approved",
    costCenter: "CC-LGL-201",
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
    status: "Disapproved",
    costCenter: "CC-SCM-018",
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
    status: "Approved",
    costCenter: "CC-SAL-090",
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
    status: "Active",
    costCenter: "CC-IT-305",
  },
];

export const MockDisbursementVouchers: DisbursementVoucherRecord[] = [
  {
    id: "dv-2026-0103",
    transactionId: "dv-tx-1001",
    voucherNo: "DV-2026-0103",
    voucherDate: "2026-05-18",
    paymentMethod: "Bank Transfer",
    disbursementType: "Vendor Payment",
    currency: "PHP",
    fxRate: "1.0000",
    costCenter: "CC-ADM-001",
    vceCode: "VCE-OD-204",
    vceName: "North Harbor Office Depot",
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
        accountCode: "2010-003",
        accountName: "Accounts Payable",
        particulars: "Settlement of approved office depot payable",
        debit: 0,
        credit: 18450,
        taxRate: "0%",
        taxDetails: createTaxDetails(18450, "0%"),
        status: "Balanced",
      },
    ],
    attachments: [],
    status: "Active",
    history: createInitialDisbursementVoucherHistory({
      voucherNo: "DV-2026-0103",
      voucherDate: "2026-05-18",
      status: "Active",
    }),
  },
  {
    id: "dv-2026-0101",
    transactionId: "dv-tx-1003",
    voucherNo: "DV-2026-0101",
    voucherDate: "2026-05-05",
    paymentMethod: "Check",
    disbursementType: "Operating Expense",
    currency: "PHP",
    fxRate: "1.0000",
    costCenter: "CC-LGL-201",
    vceCode: "VCE-LAW-108",
    vceName: "Santos and Velasco Legal",
    amount: 25000,
    taxRate: "5%",
    taxDetails: createTaxDetails(25000, "5%"),
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
        debit: 25000,
        credit: 0,
        taxRate: "5%",
        taxDetails: createTaxDetails(25000, "5%"),
        status: "Balanced",
      },
      {
        id: "entry-1004",
        accountCode: "1012-011",
        accountName: "Check Disbursement Clearing",
        particulars: "Release of legal retainer through issued check",
        debit: 0,
        credit: 25000,
        taxRate: "0%",
        taxDetails: createTaxDetails(25000, "0%"),
        status: "Balanced",
      },
    ],
    attachments: [],
    status: "Approved",
    history: createInitialDisbursementVoucherHistory({
      voucherNo: "DV-2026-0101",
      voucherDate: "2026-05-05",
      status: "Approved",
    }),
  },
  {
    id: "dv-2026-0099",
    transactionId: "dv-tx-1005",
    voucherNo: "DV-2026-0099",
    voucherDate: "2026-04-24",
    paymentMethod: "Cash",
    disbursementType: "Reimbursement",
    currency: "PHP",
    fxRate: "1.0000",
    costCenter: "CC-SAL-090",
    vceCode: "EMP-044",
    vceName: "Juan dela Cruz",
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
    status: "Approved",
    history: createInitialDisbursementVoucherHistory({
      voucherNo: "DV-2026-0099",
      voucherDate: "2026-04-24",
      status: "Approved",
    }),
  },
];

const LegacyMockAttachmentNames = new Set([
  "invoice-office-depot.pdf",
  "approval-memo-q2.docx",
  "retainer-billing.pdf",
  "travel-receipts.zip",
]);

export function removeLegacyMockAttachments(
  attachments: DisbursementAttachment[],
) {
  return attachments.filter(
    (attachment) => !LegacyMockAttachmentNames.has(attachment.name),
  );
}

export function sanitizeDisbursementVoucherRecord(
  voucher: DisbursementVoucherRecord,
): DisbursementVoucherRecord {
  return {
    ...voucher,
    referenceModule: voucher.referenceModule ?? "",
    paymentDetails: normalizePaymentDetails(
      voucher.paymentDetails ?? createEmptyPaymentDetails(),
    ),
    attachments: removeLegacyMockAttachments(voucher.attachments),
    status: getDisbursementVoucherDisplayStatus(voucher.status),
    history:
      voucher.history?.length > 0
        ? voucher.history.map(normalizeDisbursementVoucherHistoryEntry)
        : createInitialDisbursementVoucherHistory(voucher),
  };
}

export const DisbursementVoucherCopySources: DisbursementVoucherCopySource[] = [
  "Account Payable Voucher",
  "Advances to Supplier",
  "Cash Advance",
  "Cash Advance Liquidation",
  "Petty Cash Advance Excess",
  "Petty Cash Replenishment",
  "Petty Cash Fund Replenishment",
  "Purchase Order",
  "Purchase Journal",
  "Receiving Report",
];

export const DisbursementVoucherCopyFromRecords: DisbursementVoucherCopyFromRecord[] =
  [
    createDisbursementVoucherCopyFromRecord(
      "copy-dv-1001",
      "Account Payable Voucher",
      "APV-2026-0041",
      "VCE-OD-204",
      MockDisbursementTransactions[0],
      MockDisbursementVouchers[0],
    ),
    createDisbursementVoucherCopyFromRecord(
      "copy-dv-1002",
      "Advances to Supplier",
      "ATS-2026-0017",
      "VCE-MUS-118",
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
      "Cash Advance Liquidation",
      "CAL-2026-0015",
      "EMP-044",
      MockDisbursementTransactions[4],
    ),
    createDisbursementVoucherCopyFromRecord(
      "copy-dv-1005",
      "Petty Cash Advance Excess",
      "PCAE-2026-0007",
      "EMP-044",
      MockDisbursementTransactions[4],
    ),
    createDisbursementVoucherCopyFromRecord(
      "copy-dv-1006",
      "Petty Cash Replenishment",
      "PCR-2026-0019",
      "VCE-GFM-077",
      MockDisbursementTransactions[3],
    ),
    createDisbursementVoucherCopyFromRecord(
      "copy-dv-1007",
      "Petty Cash Fund Replenishment",
      "PCFR-2026-0012",
      "VCE-TPI-611",
      MockDisbursementTransactions[5],
    ),
    createDisbursementVoucherCopyFromRecord(
      "copy-dv-1008",
      "Purchase Order",
      "PO-2026-0322",
      "VCE-LAW-108",
      MockDisbursementTransactions[2],
      MockDisbursementVouchers[1],
    ),
    createDisbursementVoucherCopyFromRecord(
      "copy-dv-1009",
      "Purchase Journal",
      "PJ-2026-0088",
      "VCE-MUS-118",
      MockDisbursementTransactions[1],
    ),
    createDisbursementVoucherCopyFromRecord(
      "copy-dv-1010",
      "Receiving Report",
      "RR-2026-0144",
      "VCE-GFM-077",
      MockDisbursementTransactions[3],
    ),
  ];

export function buildDisbursementVoucherPreviewRows(
  transactions: DisbursementTransactionRecord[],
  vouchers: DisbursementVoucherRecord[],
) {
  const voucherByTransactionId = new Map(
    vouchers.map((voucher) => [voucher.transactionId, voucher]),
  );

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
      vceCode: voucher.vceCode,
      vceName: voucher.vceName,
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
    taxDetails: createTaxDetails(
      transaction?.amount ?? 0,
      transaction ? getDefaultTaxRate(transaction) : "0%",
    ),
    transactionId: transaction?.id ?? "",
    voucherNo: createNextVoucherNumber(),
    voucherDate: todayDateValue(),
    paymentMethod: transaction?.paymentMethod ?? "",
    disbursementType: transaction?.disbursementType ?? "",
    currency: transaction?.currency ?? "PHP",
    fxRate: "1.0000",
    costCenter: transaction?.costCenter ?? "",
    vceCode: "",
    vceName: transaction?.payee ?? "",
    amount: transaction ? transaction.amount.toFixed(2) : "",
    remarks: transaction?.purpose ?? "",
    referenceModule: "Disbursement Voucher",
    voucherReferenceNo: "",
    invoiceReferenceNo: "",
    paymentDueDate: transaction?.paymentDueDate ?? todayDateValue(),
    paymentDetails: createEmptyPaymentDetails(),
    preparedBy: "Finance Shared Services",
    status: "Draft",
    lineEntries: transaction
      ? ensureDisbursementLineEntries(createAutoDisbursementLineEntries(transaction))
      : [createBlankDisbursementLineEntry()],
    attachments: [],
  };
}

export function createDisbursementVoucherFromForm(
  values: DisbursementVoucherFormValues,
): DisbursementVoucherRecord {
  return {
    id: `dv-${Date.now()}`,
    transactionId: values.transactionId,
    voucherNo: values.voucherNo.trim(),
    voucherDate: values.voucherDate,
    paymentMethod: values.paymentMethod as DisbursementVoucherRecord["paymentMethod"],
    disbursementType:
      values.disbursementType as DisbursementVoucherRecord["disbursementType"],
    currency: values.currency,
    fxRate: values.fxRate.trim() || "1.0000",
    costCenter: values.costCenter.trim(),
    vceCode: values.vceCode.trim(),
    vceName: values.vceName.trim(),
    amount: parseMoneyNumberInput(values.amount),
    taxRate: values.taxRate,
    taxDetails: syncTaxDetailsAmount(
      values.taxDetails,
      parseMoneyNumberInput(values.amount),
      values.taxRate,
    ),
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
  };
}

export function createDisbursementTransactionFromForm(
  values: DisbursementVoucherFormValues,
  transaction?: DisbursementTransactionRecord,
): DisbursementTransactionRecord {
  return {
    id: transaction?.id ?? values.transactionId,
    transactionNo:
      transaction?.transactionNo ??
      (values.transactionId.trim() || createNextTransactionNumber()),
    payee: values.vceName.trim() || transaction?.payee || "Unnamed Payee",
    purpose: values.remarks.trim() || transaction?.purpose || "Disbursement voucher",
    department: transaction?.department ?? "Finance Operations",
    requestedBy:
      transaction?.requestedBy ??
      (values.preparedBy.trim() || "Finance Shared Services"),
    transactionDate: transaction?.transactionDate ?? values.voucherDate,
    paymentDueDate: values.paymentDueDate,
    amount: parseMoneyNumberInput(values.amount),
    currency: values.currency,
    paymentMethod:
      values.paymentMethod as DisbursementTransactionRecord["paymentMethod"],
    disbursementType:
      values.disbursementType as DisbursementTransactionRecord["disbursementType"],
    status: values.status,
    costCenter: values.costCenter.trim(),
    accountingEntries: ensureDisbursementLineEntries(values.lineEntries),
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
    vceCode: record.templateValues.vceCode,
    vceName: record.templateValues.vceName,
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
    return applyCopyFromRecordToDisbursementVoucherForm(
      currentValues,
      firstRecord,
    );
  }

  const firstValues = firstRecord.templateValues;
  const totalAmount = records.reduce(
    (sum, record) => sum + Number(record.templateValues.amount || 0),
    0,
  );
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
  const attachments = records.flatMap((record) =>
    removeLegacyMockAttachments(record.templateValues.attachments),
  );

  return {
    ...currentValues,
    transactionId: firstRecord.transactionId,
    paymentMethod: firstValues.paymentMethod,
    disbursementType: firstValues.disbursementType,
    currency: firstValues.currency,
    fxRate: firstValues.fxRate,
    costCenter: firstValues.costCenter,
    vceCode: records.every((record) => record.partyCode === firstRecord.partyCode)
      ? firstValues.vceCode
      : "",
    vceName: records.every((record) => record.partyName === firstRecord.partyName)
      ? firstValues.vceName
      : "Multiple Parties",
    amount: totalAmount.toFixed(2),
    taxRate: firstValues.taxRate,
    taxDetails: syncTaxDetailsAmount(
      firstValues.taxDetails,
      totalAmount,
      firstValues.taxRate,
    ),
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

export function updateDisbursementVoucherFromForm(
  voucher: DisbursementVoucherRecord,
  values: DisbursementVoucherFormValues,
) {
  return {
    ...createDisbursementVoucherFromForm(values),
    id: voucher.id,
    history: voucher.history,
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

export function createDisbursementLineEntry(
  draft: DisbursementVoucherEntryDraft,
): DisbursementLineEntry {
  const amount =
    parseMoneyNumberInput(draft.debit) || parseMoneyNumberInput(draft.credit);
  const taxDetails = syncTaxDetailsAmount(
    {
      ...draft.taxDetails,
      atcCode: draft.atcCode?.trim() ?? draft.taxDetails.atcCode,
      refId: draft.refId?.trim() ?? draft.taxDetails.refId,
      responsibilityCenter:
        draft.responsibilityCenter?.trim() ??
        draft.taxDetails.responsibilityCenter,
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
  const amount = transaction.amount;
  const debitAccount = getDebitAccountTemplate(transaction);
  const creditAccount = getCreditAccountTemplate(
    transaction,
    bankAccount,
    paymentAccount,
  );
  const taxRate = getDefaultTaxRate(transaction);
  const creditParticulars = createCreditParticulars(
    transaction,
    bankAccount,
    paymentAccount,
  );

  return [
    {
      id: `auto-debit-${transaction.id}`,
      accountCode: debitAccount.accountCode,
      accountName: debitAccount.accountName,
      atcCode: "",
      particulars: transaction.purpose,
      partyCode: "",
      partyName: transaction.payee,
      refId: transaction.transactionNo || transaction.id,
      responsibilityCenter: transaction.costCenter,
      debit: amount,
      credit: 0,
      taxRate,
      taxDetails: {
        ...createTaxDetails(amount, taxRate),
        refId: transaction.transactionNo || transaction.id,
        responsibilityCenter: transaction.costCenter,
      },
      vatType: "",
      status: "Balanced",
    },
    {
      id: `auto-credit-${transaction.id}`,
      accountCode: creditAccount.accountCode,
      accountName: creditAccount.accountName,
      atcCode: "",
      particulars: creditParticulars,
      partyCode: "",
      partyName: transaction.payee,
      refId: transaction.transactionNo || transaction.id,
      responsibilityCenter: transaction.costCenter,
      debit: 0,
      credit: amount,
      taxRate: "0%",
      taxDetails: {
        ...createTaxDetails(amount, "0%"),
        refId: transaction.transactionNo || transaction.id,
        responsibilityCenter: transaction.costCenter,
      },
      vatType: "",
      status: "Balanced",
    },
  ];
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
          accountName: formatBankPaymentAccountName(bankAccount),
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
  const vatPercent = parseTaxPercent(taxRate);
  const vatAmount = roundCurrency((amount * vatPercent) / 100);
  const ewtPercent = 0;
  const ewtAmount = 0;
  const netAmount = roundCurrency(amount - ewtAmount);

  return {
    code: "",
    name: "",
    responsibilityCenter: "",
    refId: "",
    vatType: "",
    atcCode: "",
    grossAmount: amount,
    netAmount,
    vatCode: taxRate !== "0%" ? `VAT-${taxRate.replace("%", "")}` : "",
    vatPercent,
    vatAmount,
    ewtCode: "",
    ewtPercent,
    ewtAmount,
    amount: netAmount,
  };
}

export function syncTaxDetailsAmount(
  currentTaxDetails: DisbursementTaxDetails | undefined,
  amount: number,
  taxRate: string,
) {
  const baseTaxDetails = currentTaxDetails ?? createTaxDetails(amount, taxRate);
  const vatPercent =
    baseTaxDetails.vatCode || baseTaxDetails.vatPercent > 0
      ? baseTaxDetails.vatPercent
      : parseTaxPercent(taxRate);
  const vatAmount = roundCurrency((amount * vatPercent) / 100);
  const ewtAmount = roundCurrency((amount * baseTaxDetails.ewtPercent) / 100);
  const netAmount = roundCurrency(amount - ewtAmount);

  return {
    ...baseTaxDetails,
    grossAmount: amount,
    netAmount,
    vatPercent,
    vatAmount,
    ewtAmount,
    amount: netAmount,
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
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getDisbursementVoucherDisplayStatus(
  status: string,
): DisbursementVoucherDisplayStatus {
  if (status === "Pending Review") {
    return "Pending";
  }

  if (status === "Rejected") {
    return "Disapproved";
  }

  if (status === "Completed") {
    return "Closed";
  }

  if (
    status === "Active" ||
    status === "Draft" ||
    status === "Pending" ||
    status === "Approved" ||
    status === "Disapproved" ||
    status === "Cancelled" ||
    status === "Closed"
  ) {
    return status;
  }

  return "Draft";
}

function createInitialDisbursementVoucherHistory(
  voucher: Pick<DisbursementVoucherRecord, "voucherNo" | "voucherDate" | "status">,
): DisbursementVoucherHistoryEntry[] {
  const createdStatus =
    voucher.status === "Draft" ? "Draft" : voucher.status === "Pending" ? "Pending" : "Active";
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

function normalizeDisbursementVoucherHistoryEntry(
  entry: DisbursementVoucherHistoryEntry,
): DisbursementVoucherHistoryEntry {
  const status = getDisbursementVoucherDisplayStatus(entry.status);

  return {
    id: entry.id || `dv-history-${Date.now()}`,
    action: entry.action || getDisbursementVoucherHistoryAction(status),
    actor: entry.actor || "System",
    createdAt: entry.createdAt || new Date().toISOString(),
    description:
      entry.description ||
      getDisbursementVoucherHistoryDescription(
        status,
        "this disbursement voucher",
      ),
    status,
  };
}

function createDisbursementVoucherHistoryDate(
  voucherDate: string,
  hour: number,
) {
  const date = voucherDate || new Date().toISOString().slice(0, 10);

  return `${date}T${hour.toString().padStart(2, "0")}:00:00.000Z`;
}

function getDisbursementVoucherHistoryAction(
  status: DisbursementVoucherStatus,
) {
  if (status === "Approved") {
    return "Approved";
  }

  if (status === "Disapproved") {
    return "Disapproved";
  }

  if (status === "Cancelled") {
    return "Cancelled";
  }

  if (status === "Active") {
    return "Activated";
  }

  if (status === "Closed") {
    return "Closed";
  }

  if (status === "Pending") {
    return "Reopened";
  }

  return "Updated";
}

function getDisbursementVoucherHistoryDescription(
  status: DisbursementVoucherStatus,
  voucherNo: string,
) {
  if (status === "Approved") {
    return `${voucherNo} was approved for disbursement processing.`;
  }

  if (status === "Disapproved") {
    return `${voucherNo} was disapproved and returned for review.`;
  }

  if (status === "Cancelled") {
    return `${voucherNo} was cancelled.`;
  }

  if (status === "Active") {
    return `${voucherNo} was restored to active processing.`;
  }

  if (status === "Closed") {
    return `${voucherNo} was closed.`;
  }

  if (status === "Draft") {
    return `${voucherNo} was restored to draft.`;
  }

  return `${voucherNo} was returned to pending approval.`;
}

export function isDisbursementVoucherActiveStatus(status: string) {
  const displayStatus = getDisbursementVoucherDisplayStatus(status);

  return displayStatus === "Active" || displayStatus === "Pending";
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
      vceCode: voucher?.vceCode ?? partyCode,
      vceName: voucher?.vceName ?? transaction.payee,
      remarks:
        voucher?.remarks ??
        `${transaction.purpose} Copied from ${sourceNo}.`,
      referenceModule: voucher?.referenceModule ?? source,
      invoiceReferenceNo:
        voucher?.invoiceReferenceNo ?? `${sourceNo}-REF`,
      attachments: voucher?.attachments ?? createAttachmentPlaceholders(),
      lineEntries:
        voucher?.lineEntries ?? createAutoDisbursementLineEntries(transaction),
    },
  };
}

function getDebitAccountTemplate(transaction: DisbursementTransactionRecord) {
  if (transaction.disbursementType === "Vendor Payment") {
    return {
      accountCode: "2010-003",
      accountName: "Accounts Payable",
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
      accountName: formatBankPaymentAccountName(bankAccount),
    };
  }

  if (paymentAccount?.type === "Cash") {
    return {
      accountCode: "1001111",
      accountName: "Cash in Hand",
    };
  }

  if (
    paymentAccount?.type === "With Bank" ||
    paymentAccount?.type === "Multiple Check"
  ) {
    return {
      accountCode: "1012-011",
      accountName: "Check Disbursement Clearing",
    };
  }

  if (paymentAccount?.type === "Debit") {
    return {
      accountCode: "1013-001",
      accountName: "Debit Memo Clearing",
    };
  }

  if (paymentAccount?.type === "Bank Transfer") {
    return {
      accountCode: "1010-001",
      accountName: "Cash in Bank",
    };
  }

  if (paymentAccount?.type === "Online Payment") {
    return {
      accountCode: "1011-008",
      accountName: "Online Payment Clearing",
    };
  }

  if (paymentAccount?.accountCode?.trim() || paymentAccount?.accountTitle?.trim()) {
    return {
      accountCode: paymentAccount.accountCode?.trim() ?? "",
      accountName: getPaymentAccountName(paymentAccount),
    };
  }

  if (transaction.paymentMethod === "Cash") {
    return {
      accountCode: "1001111",
      accountName: "Cash in Hand",
    };
  }

  if (
    transaction.paymentMethod === "Check" ||
    transaction.paymentMethod === "Manager's Check"
  ) {
    return {
      accountCode: "1012-011",
      accountName: "Check Disbursement Clearing",
    };
  }

  if (
    transaction.paymentMethod === "InstaPay" ||
    transaction.paymentMethod === "eWallet"
  ) {
    return {
      accountCode: "1011-008",
      accountName: "Online Payment Clearing",
    };
  }

  return {
    accountCode: "1010-001",
    accountName: "Cash in Bank",
  };
}

function formatBankPaymentAccountName(
  bankAccount: DisbursementVoucherBankAccount,
) {
  const bankLabel = getBankDisplayName(bankAccount.bankName);

  return bankLabel ? `Cash in Bank - ${bankLabel}` : "Cash in Bank";
}

function getBankDisplayName(bankName: string) {
  const trimmedName = bankName.trim();

  if (!trimmedName) {
    return "";
  }

  return trimmedName.split(/\s+/)[0];
}

function getPaymentAccountName(
  paymentAccount: DisbursementVoucherPaymentAccount,
) {
  if (paymentAccount.type === "Cash" || paymentAccount.paymentType === "Cash") {
    return "Cash in Hand";
  }

  return paymentAccount.accountTitle?.trim() || paymentAccount.paymentType;
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
    return [
      `Settlement${payee}${paymentLabel}`,
      bankAccount.bankName,
      bankAccount.branch,
    ]
      .filter(Boolean)
      .join(" - ");
  }

  return `Settlement${payee}${paymentLabel}`;
}

function getDefaultTaxRate(transaction: DisbursementTransactionRecord) {
  if (transaction.disbursementType === "Operating Expense") {
    return "5%";
  }

  if (transaction.disbursementType === "Capital Expenditure") {
    return "12%";
  }

  return "0%";
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
    commission: "",
    payee: "",
    paymentReferenceNo: "",
    transferAccountName: "",
    transferAccountNo: "",
    transferToBank: "",
    transferTo: "",
  };
}

function normalizePaymentDetails(
  paymentDetails: DisbursementVoucherPaymentDetails,
): DisbursementVoucherPaymentDetails {
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
    commission: paymentDetails.commission?.trim() ?? "",
    payee: paymentDetails.payee?.trim() ?? "",
    paymentReferenceNo: paymentDetails.paymentReferenceNo.trim(),
    transferAccountName: paymentDetails.transferAccountName?.trim() ?? "",
    transferAccountNo: paymentDetails.transferAccountNo?.trim() ?? "",
    transferToBank: paymentDetails.transferToBank?.trim() ?? "",
    transferTo: paymentDetails.transferTo?.trim() ?? "",
  };
}
