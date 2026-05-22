import type {
  DisbursementAttachment,
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementTransactionRecord,
  DisbursementVoucherEntryDraft,
  DisbursementVoucherFormValues,
  DisbursementVoucherRecord,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export const DisbursementVoucherInitialEntryDraft: DisbursementVoucherEntryDraft =
  {
    accountCode: "",
    accountName: "",
    particulars: "",
    debit: "",
    credit: "",
    taxRate: "0%",
    taxDetails: createTaxDetails(0, "0%"),
  };

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
    status: "Approved",
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
    paymentMethod: "Online Payment",
    disbursementType: "Operating Expense",
    status: "Pending Review",
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
    status: "Rejected",
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
    paymentMethod: "Petty Cash",
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
    status: "Pending Review",
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
    remarks: "Rush replenishment approved for Q2 workspace consumables.",
    voucherReferenceNo: "DVR-2026-0094",
    invoiceReferenceNo: "INV-OFF-5521",
    paymentDueDate: "2026-05-21",
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
    attachments: [
      { id: "file-1001", name: "invoice-office-depot.pdf", sizeLabel: "248 KB" },
      { id: "file-1002", name: "approval-memo-q2.docx", sizeLabel: "118 KB" },
    ],
    status: "Approved",
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
    remarks: "Monthly legal retainer for regulatory and contract support.",
    voucherReferenceNo: "DVR-2026-0081",
    invoiceReferenceNo: "RET-0503-24",
    paymentDueDate: "2026-05-17",
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
    attachments: [
      { id: "file-1003", name: "retainer-billing.pdf", sizeLabel: "192 KB" },
    ],
    status: "Approved",
  },
  {
    id: "dv-2026-0099",
    transactionId: "dv-tx-1005",
    voucherNo: "DV-2026-0099",
    voucherDate: "2026-04-24",
    paymentMethod: "Petty Cash",
    disbursementType: "Reimbursement",
    currency: "PHP",
    fxRate: "1.0000",
    costCenter: "CC-SAL-090",
    vceCode: "EMP-044",
    vceName: "Juan dela Cruz",
    amount: 3200,
    remarks: "Travel reimbursement for client branch roadshow.",
    voucherReferenceNo: "DVR-2026-0067",
    invoiceReferenceNo: "TRV-APR-778",
    paymentDueDate: "2026-04-29",
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
        accountCode: "1005-001",
        accountName: "Petty Cash Fund",
        particulars: "Petty cash release",
        debit: 0,
        credit: 3200,
        taxRate: "0%",
        taxDetails: createTaxDetails(3200, "0%"),
        status: "Balanced",
      },
    ],
    attachments: [
      { id: "file-1004", name: "travel-receipts.zip", sizeLabel: "612 KB" },
    ],
    status: "Approved",
  },
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
      remarks: voucher.remarks,
      voucherReferenceNo: voucher.voucherReferenceNo,
      invoiceReferenceNo: voucher.invoiceReferenceNo,
      paymentDueDate: voucher.paymentDueDate,
      preparedBy: voucher.preparedBy,
      status: voucher.status,
      lineEntries: voucher.lineEntries,
      attachments: voucher.attachments,
    };
  }

  return {
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
    voucherReferenceNo: createVoucherReferenceNumber(),
    invoiceReferenceNo: "",
    paymentDueDate: transaction?.paymentDueDate ?? todayDateValue(),
    preparedBy: "Finance Shared Services",
    status: "Draft",
    lineEntries: transaction
      ? createAutoDisbursementLineEntries(transaction)
      : [],
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
    amount: Number(values.amount || 0),
    remarks: values.remarks.trim(),
    voucherReferenceNo: values.voucherReferenceNo.trim(),
    invoiceReferenceNo: values.invoiceReferenceNo.trim(),
    paymentDueDate: values.paymentDueDate,
    preparedBy: values.preparedBy.trim(),
    status: values.status,
    lineEntries: values.lineEntries,
    attachments: values.attachments,
  };
}

export function updateDisbursementVoucherFromForm(
  voucher: DisbursementVoucherRecord,
  values: DisbursementVoucherFormValues,
) {
  return {
    ...createDisbursementVoucherFromForm(values),
    id: voucher.id,
  };
}

export function createDisbursementLineEntry(
  draft: DisbursementVoucherEntryDraft,
): DisbursementLineEntry {
  return {
    id: `line-${Date.now()}`,
    accountCode: draft.accountCode.trim(),
    accountName: draft.accountName.trim(),
    particulars: draft.particulars.trim(),
    debit: Number(draft.debit || 0),
    credit: Number(draft.credit || 0),
    taxRate: draft.taxRate,
    taxDetails: syncTaxDetailsAmount(
      draft.taxDetails,
      Number(draft.debit || 0) || Number(draft.credit || 0),
      draft.taxRate,
    ),
    status: "Balanced",
  };
}

export function createAutoDisbursementLineEntries(
  transaction: DisbursementTransactionRecord,
): DisbursementLineEntry[] {
  const amount = transaction.amount;
  const debitAccount = getDebitAccountTemplate(transaction);
  const creditAccount = getCreditAccountTemplate(transaction);
  const taxRate = getDefaultTaxRate(transaction);

  return [
    {
      id: `auto-debit-${transaction.id}`,
      accountCode: debitAccount.accountCode,
      accountName: debitAccount.accountName,
      particulars: transaction.purpose,
      debit: amount,
      credit: 0,
      taxRate,
      taxDetails: createTaxDetails(amount, taxRate),
      status: "Balanced",
    },
    {
      id: `auto-credit-${transaction.id}`,
      accountCode: creditAccount.accountCode,
      accountName: creditAccount.accountName,
      particulars: `Settlement for ${transaction.payee}`,
      debit: 0,
      credit: amount,
      taxRate: "0%",
      taxDetails: createTaxDetails(amount, "0%"),
      status: "Balanced",
    },
  ];
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
  const vatLabel = taxDetails.vatPercent > 0 ? `VAT ${taxDetails.vatPercent}%` : "No VAT";
  const ewtLabel = taxDetails.ewtPercent > 0 ? ` / EWT ${taxDetails.ewtPercent}%` : "";

  return `${vatLabel}${ewtLabel}`;
}

export function createAttachmentPlaceholders(
  transaction: DisbursementTransactionRecord,
): DisbursementAttachment[] {
  return [
    {
      id: `att-${transaction.id}-1`,
      name: `${transaction.transactionNo.toLowerCase()}-source-doc.pdf`,
      sizeLabel: "240 KB",
    },
    {
      id: `att-${transaction.id}-2`,
      name: `${transaction.department.toLowerCase().replace(/\s+/g, "-")}-approval-note.docx`,
      sizeLabel: "96 KB",
    },
  ];
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

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function createNextVoucherNumber() {
  const serial = String(new Date().getTime()).slice(-4);

  return `DV-${new Date().getFullYear()}-${serial}`;
}

function createVoucherReferenceNumber() {
  const serial = String(new Date().getTime()).slice(-4);

  return `DVR-${new Date().getFullYear()}-${serial}`;
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

function getCreditAccountTemplate(transaction: DisbursementTransactionRecord) {
  if (transaction.paymentMethod === "Petty Cash") {
    return {
      accountCode: "1005-001",
      accountName: "Petty Cash Fund",
    };
  }

  if (transaction.paymentMethod === "Check") {
    return {
      accountCode: "1012-011",
      accountName: "Check Disbursement Clearing",
    };
  }

  if (transaction.paymentMethod === "Online Payment") {
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
