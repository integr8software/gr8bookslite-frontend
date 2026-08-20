import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  OfficialReceiptCopyFromRecord,
  OfficialReceiptFormValues,
  OfficialReceiptLineEntry,
  OfficialReceiptRecord,
  OfficialReceiptStatus,
  OfficialReceiptTotals,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";

export const MockOfficialReceipts: OfficialReceiptRecord[] = [
  {
    id: "or-001",
    receiptNo: "OR-2026-0001",
    receiptDate: "2026-07-03",
    customerName: "Aster Foods Corporation",
    partyCode: "PTY-0001",
    collectionType: "Customer payment",
    referenceNo: "SI-2026-0188",
    amount: 184500,
    status: "Approved",
  },
  {
    id: "or-002",
    receiptNo: "OR-2026-0002",
    receiptDate: "2026-07-04",
    customerName: "Northline Retail Group",
    partyCode: "PTY-0002",
    collectionType: "Service income",
    referenceNo: "SOA-2026-0042",
    amount: 76250,
    status: "Pending",
  },
  {
    id: "or-003",
    receiptNo: "OR-2026-0003",
    receiptDate: "2026-07-05",
    customerName: "Bluecrest Trading",
    partyCode: "PTY-0003",
    collectionType: "Advance deposit",
    referenceNo: "DEP-2026-0015",
    amount: 52000,
    status: "Active",
  },
  {
    id: "or-004",
    receiptNo: "OR-2026-0004",
    receiptDate: "2026-07-06",
    customerName: "Mendoza and Lee Partners",
    partyCode: "PTY-0004",
    collectionType: "Rental collection",
    referenceNo: "LS-2026-0091",
    amount: 128900,
    status: "Draft",
  },
  {
    id: "or-005",
    receiptNo: "OR-2026-0005",
    receiptDate: "2026-07-07",
    customerName: "Harborview Logistics",
    partyCode: "PTY-0005",
    collectionType: "Customer payment",
    referenceNo: "SI-2026-0204",
    amount: 214300,
    status: "Closed",
  },
];

export const OfficialReceiptStorageKey = "gr8books.official-receipt.receipts";

export const OfficialReceiptPaymentTypeOptions = [
  { name: "Cash", value: "Cash" },
  { name: "Check", value: "Check" },
  { name: "Bank deposit", value: "Bank deposit" },
  { name: "Online transfer", value: "Online transfer" },
];

export const OfficialReceiptPartyOptions = [
  { name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
  { name: "Northline Retail Group", value: "Northline Retail Group" },
  { name: "Bluecrest Trading", value: "Bluecrest Trading" },
  { name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const OfficialReceiptCurrencyOptions = [
  { name: "PHP", value: "PHP" },
  { name: "USD", value: "USD" },
];

export const OfficialReceiptCollectionTypeOptions = [
  { name: "Customer payment", value: "Customer payment" },
  { name: "Service income", value: "Service income" },
  { name: "Advance deposit", value: "Advance deposit" },
  { name: "Rental collection", value: "Rental collection" },
];

export const OfficialReceiptCopyFromRecords: OfficialReceiptCopyFromRecord[] = [
  {
    amount: "184,500.00",
    collectionType: "Customer payment",
    customerName: "Aster Foods Corporation",
    debit: "184,500.00",
    credit: "184,500.00",
    documentDate: "2026-07-08",
    grossReceipt: "184,500.0000",
    id: "si-2026-0211",
    partyCode: "PTY-0001",
    partyName: "Aster Foods Corporation",
    remarks: "Payment for Sales Invoice SI-2026-0211",
    source: "Sales invoice",
    sourceNo: "SI-2026-0211",
  },
  {
    amount: "92,400.00",
    collectionType: "Customer payment",
    customerName: "Aster Foods Corporation",
    debit: "92,400.00",
    credit: "92,400.00",
    documentDate: "2026-07-09",
    grossReceipt: "92,400.0000",
    id: "si-2026-0212",
    partyCode: "PTY-0001",
    partyName: "Aster Foods Corporation",
    remarks: "Payment for Sales Invoice SI-2026-0212",
    source: "Sales invoice",
    sourceNo: "SI-2026-0212",
  },
  {
    amount: "76,250.00",
    collectionType: "Service income",
    customerName: "Northline Retail Group",
    debit: "76,250.00",
    credit: "76,250.00",
    documentDate: "2026-07-04",
    grossReceipt: "76,250.0000",
    id: "soa-2026-0042",
    partyCode: "PTY-0002",
    partyName: "Northline Retail Group",
    remarks: "Settlement for Statement of Account SOA-2026-0042",
    source: "Statement of account",
    sourceNo: "SOA-2026-0042",
  },
  {
    amount: "48,800.00",
    collectionType: "Customer payment",
    customerName: "Bluecrest Trading",
    debit: "48,800.00",
    credit: "48,800.00",
    documentDate: "2026-07-06",
    grossReceipt: "48,800.0000",
    id: "soa-2026-0043",
    partyCode: "PTY-0003",
    partyName: "Bluecrest Trading",
    remarks: "Settlement for Statement of Account SOA-2026-0043",
    source: "Statement of account",
    sourceNo: "SOA-2026-0043",
  },
  {
    amount: "135,000.00",
    collectionType: "Service income",
    customerName: "Harborview Logistics",
    debit: "135,000.00",
    credit: "135,000.00",
    documentDate: "2026-07-10",
    grossReceipt: "135,000.0000",
    id: "bs-2026-0010",
    partyCode: "PTY-0005",
    partyName: "Harborview Logistics",
    remarks: "Collection for Billing Statement BS-2026-0010",
    source: "Billing statement",
    sourceNo: "BS-2026-0010",
  },
  {
    amount: "64,300.00",
    collectionType: "Customer payment",
    customerName: "Mendoza and Lee Partners",
    debit: "64,300.00",
    credit: "64,300.00",
    documentDate: "2026-07-11",
    grossReceipt: "64,300.0000",
    id: "bi-2026-0035",
    partyCode: "PTY-0004",
    partyName: "Mendoza and Lee Partners",
    remarks: "Collection for Billing Invoice BI-2026-0035",
    source: "Billing invoice",
    sourceNo: "BI-2026-0035",
  },
  {
    amount: "52,000.00",
    collectionType: "Advance deposit",
    customerName: "Bluecrest Trading",
    debit: "52,000.00",
    credit: "52,000.00",
    documentDate: "2026-07-12",
    grossReceipt: "52,000.0000",
    id: "ord-2026-0101",
    partyCode: "PTY-0003",
    partyName: "Bluecrest Trading",
    remarks: "Downpayment for Order ORD-2026-0101",
    source: "Customer Order",
    sourceNo: "ORD-2026-0101",
  },
];

export const OfficialReceiptCopySources = [
  "Sales invoice",
  "Statement of account",
  "Billing statement",
  "Billing invoice",
  "Customer Order",
];

export function applyCopyFromRecordToOfficialReceiptForm(
  currentValues: OfficialReceiptFormValues,
  record: OfficialReceiptCopyFromRecord,
): OfficialReceiptFormValues {
  const partyName = record.partyName || record.customerName || currentValues.customerName;
  const partyCode = record.partyCode || currentValues.partyCode;
  const rawAmount = typeof record.amount === "string" ? record.amount.replace(/,/g, "") : "0";
  const numAmount = Number(rawAmount) || 0;
  const formattedAmount = numAmount > 0 ? numAmount.toFixed(2) : "0.00";
  const formattedGross = numAmount > 0 ? numAmount.toFixed(4) : "0.0000";

  const lineEntries: OfficialReceiptLineEntry[] = record.lineEntries && record.lineEntries.length > 0
    ? record.lineEntries.map((entry) => ({ ...entry }))
    : [
        createBlankOfficialReceiptLineEntry({
          accountCode: record.accountCode || "1010",
          accountTitle: record.accountTitle || "Cash in Bank",
          collectionType: record.collectionType || "Customer payment",
          credit: record.credit || formattedAmount,
          customerName: partyName,
          debit: record.debit || formattedAmount,
          grossReceipt: record.grossReceipt || formattedGross,
          partyCode,
          referenceNo: record.sourceNo,
          vat: record.vat || "0.0000",
          vatExempt: record.vatExempt || "0.0000",
          ewt: record.ewt || "0.0000",
        }),
      ];

  return {
    ...currentValues,
    customerName: partyName,
    partyCode,
    paymentType: record.paymentType || currentValues.paymentType,
    currency: record.currency || currentValues.currency,
    exchangeRate: record.exchangeRate || currentValues.exchangeRate,
    referenceNo: record.sourceNo,
    remarks: record.remarks || `Copied from ${record.source} ${record.sourceNo}`,
    lineEntries,
  };
}

export function applyCopyFromRecordsToOfficialReceiptForm(
  currentValues: OfficialReceiptFormValues,
  records: OfficialReceiptCopyFromRecord[],
): OfficialReceiptFormValues {
  if (records.length === 0) {
    return currentValues;
  }

  if (records.length === 1 && records[0]) {
    return applyCopyFromRecordToOfficialReceiptForm(currentValues, records[0]);
  }

  const firstRecord = records[0];
  if (!firstRecord) {
    return currentValues;
  }

  const partyName = firstRecord.partyName || firstRecord.customerName || currentValues.customerName;
  const partyCode = firstRecord.partyCode || currentValues.partyCode;
  const combinedRefNo = records.map((record) => record.sourceNo).join(", ");
  const combinedRemarks = records
    .map((record) => record.remarks || `Copied from ${record.source} ${record.sourceNo}`)
    .join("\n");

  const lineEntries: OfficialReceiptLineEntry[] = records.flatMap((record, index) => {
    if (record.lineEntries && record.lineEntries.length > 0) {
      return record.lineEntries.map((entry, entryIndex) => ({
        ...entry,
        id: `copied-line-${record.id}-${index}-${entryIndex}-${Date.now()}`,
        referenceNo: entry.referenceNo || record.sourceNo,
      }));
    }

    const rawAmount = typeof record.amount === "string" ? record.amount.replace(/,/g, "") : "0";
    const numAmount = Number(rawAmount) || 0;
    const formattedAmount = numAmount > 0 ? numAmount.toFixed(2) : "0.00";
    const formattedGross = numAmount > 0 ? numAmount.toFixed(4) : "0.0000";

    return [
      createBlankOfficialReceiptLineEntry({
        id: `copied-line-${record.id}-${index}-${Date.now()}`,
        accountCode: record.accountCode || "1010",
        accountTitle: record.accountTitle || "Cash in Bank",
        collectionType: record.collectionType || "Customer payment",
        credit: record.credit || formattedAmount,
        customerName: record.partyName || record.customerName || partyName,
        debit: record.debit || formattedAmount,
        grossReceipt: record.grossReceipt || formattedGross,
        partyCode: record.partyCode || partyCode,
        referenceNo: record.sourceNo,
        vat: record.vat || "0.0000",
        vatExempt: record.vatExempt || "0.0000",
        ewt: record.ewt || "0.0000",
      }),
    ];
  });

  return {
    ...currentValues,
    customerName: partyName,
    partyCode,
    paymentType: firstRecord.paymentType || currentValues.paymentType,
    currency: firstRecord.currency || currentValues.currency,
    exchangeRate: firstRecord.exchangeRate || currentValues.exchangeRate,
    referenceNo: combinedRefNo,
    remarks: combinedRemarks,
    lineEntries: lineEntries.length > 0 ? lineEntries : currentValues.lineEntries,
  };
}

export function createBlankOfficialReceiptLineEntry(overrides: Partial<OfficialReceiptLineEntry> = {}): OfficialReceiptLineEntry {
  return {
    id: `or-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountCode: "",
    accountTitle: "",
    collectionType: "",
    customerName: "",
    partyCode: "",
    grossReceipt: "0.0000",
    vatExempt: "0.0000",
    vat: "0.0000",
    ewt: "0.0000",
    debit: "0.00",
    credit: "0.00",
    referenceNo: "",
    ...overrides,
  };
}

export function createOfficialReceiptFormValues(): OfficialReceiptFormValues {
  return {
    receiptNo: "OR-2026-0006",
    receiptDate: "2026-07-08",
    referenceNo: "",
    customerName: "",
    partyCode: "",
    paymentType: "",
    currency: "PHP",
    exchangeRate: "1.0000",
    status: "Draft",
    remarks: "",
    attachments: [],
    lineEntries: [
      createBlankOfficialReceiptLineEntry({
        accountCode: "1010",
        accountTitle: "Cash in Bank",
      }),
    ],
  };
}

export function createOfficialReceiptFormValuesFromRecord(record: OfficialReceiptRecord): OfficialReceiptFormValues {
  if (record.formValues) {
    return {
      ...record.formValues,
      attachments: record.formValues.attachments ? [...record.formValues.attachments] : [],
      lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
    };
  }

  return {
    ...createOfficialReceiptFormValues(),
    receiptNo: record.receiptNo,
    receiptDate: record.receiptDate,
    referenceNo: record.referenceNo,
    customerName: record.customerName,
    partyCode: record.partyCode ?? "",
    status: record.status,
    attachments: [],
    lineEntries: [
      createBlankOfficialReceiptLineEntry({
        collectionType: record.collectionType,
        customerName: record.customerName,
        partyCode: record.partyCode ?? "",
        credit: record.amount.toFixed(2),
        grossReceipt: record.amount.toFixed(4),
        referenceNo: record.referenceNo,
      }),
    ],
  };
}

export function createOfficialReceiptRecordFromForm(
  values: OfficialReceiptFormValues,
  existingRecord?: OfficialReceiptRecord,
): OfficialReceiptRecord {
  const totals = calculateOfficialReceiptTotals(values.lineEntries);
  const firstEntry = values.lineEntries[0];
  const amount = Math.max(totals.grossReceipt, totals.debit, totals.credit);

  return {
    id: existingRecord?.id ?? `or-${Date.now()}`,
    amount,
    collectionType: firstEntry?.collectionType || "Customer payment",
    customerName: values.customerName || firstEntry?.customerName || "",
    partyCode: values.partyCode || firstEntry?.partyCode || "",
    formValues: {
      ...values,
      lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
    },
    receiptDate: values.receiptDate,
    receiptNo: values.receiptNo,
    referenceNo: values.referenceNo || firstEntry?.referenceNo || "",
    status: normalizeOfficialReceiptStatus(values.status),
  };
}

export function readStoredOfficialReceipts() {
  return readStoredReceiptsByKey(OfficialReceiptStorageKey);
}

export function readStoredReceiptsByKey(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const storedReceipts = window.localStorage.getItem(storageKey);

  if (!storedReceipts) {
    return null;
  }

  try {
    const parsedReceipts = JSON.parse(storedReceipts) as OfficialReceiptRecord[];

    return Array.isArray(parsedReceipts) ? parsedReceipts : null;
  } catch {
    return null;
  }
}

export function writeStoredOfficialReceipts(receipts: OfficialReceiptRecord[]) {
  writeStoredReceiptsByKey(OfficialReceiptStorageKey, receipts);
}

export function writeStoredReceiptsByKey(storageKey: string, receipts: OfficialReceiptRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(receipts));
}

export function getInitialOfficialReceipts() {
  return readStoredOfficialReceipts() ?? MockOfficialReceipts;
}

export function getInitialReceiptsByKey(storageKey: string, fallbackReceipts: OfficialReceiptRecord[]) {
  return readStoredReceiptsByKey(storageKey) ?? fallbackReceipts;
}

export function calculateOfficialReceiptTotals(entries: OfficialReceiptLineEntry[]): OfficialReceiptTotals {
  return entries.reduce(
    (summary, entry) => ({
      credit: summary.credit + parseMoneyNumberInput(entry.credit),
      debit: summary.debit + parseMoneyNumberInput(entry.debit),
      ewt: summary.ewt + parseMoneyNumberInput(entry.ewt),
      grossReceipt: summary.grossReceipt + parseMoneyNumberInput(entry.grossReceipt),
      vat: summary.vat + parseMoneyNumberInput(entry.vat),
      vatExempt: summary.vatExempt + parseMoneyNumberInput(entry.vatExempt),
    }),
    {
      credit: 0,
      debit: 0,
      ewt: 0,
      grossReceipt: 0,
      vat: 0,
      vatExempt: 0,
    },
  );
}

export function formatOfficialReceiptAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatOfficialReceiptCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amount);
}

export function formatOfficialReceiptDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function countOfficialReceiptsByStatus(receipts: OfficialReceiptRecord[], status: OfficialReceiptStatus) {
  return receipts.filter((receipt) => receipt.status === status).length;
}

export function isOfficialReceiptActiveStatus(status: OfficialReceiptStatus) {
  return status === "Active" || status === "Approved";
}

export function formatOfficialReceiptPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function officialReceiptEntryHasData(entry: OfficialReceiptLineEntry) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountTitle.trim() !== "" ||
    entry.collectionType.trim() !== "" ||
    entry.customerName.trim() !== "" ||
    entry.referenceNo.trim() !== "" ||
    parseMoneyNumberInput(entry.grossReceipt) > 0 ||
    parseMoneyNumberInput(entry.vatExempt) > 0 ||
    parseMoneyNumberInput(entry.vat) > 0 ||
    parseMoneyNumberInput(entry.ewt) > 0 ||
    parseMoneyNumberInput(entry.debit) > 0 ||
    parseMoneyNumberInput(entry.credit) > 0
  );
}

export function officialReceiptEntryIsComplete(entry: OfficialReceiptLineEntry) {
  return (
    entry.collectionType.trim() !== "" &&
    entry.customerName.trim() !== "" &&
    (parseMoneyNumberInput(entry.grossReceipt) > 0 || parseMoneyNumberInput(entry.debit) > 0 || parseMoneyNumberInput(entry.credit) > 0)
  );
}

function normalizeOfficialReceiptStatus(value: string): OfficialReceiptStatus {
  const statuses: OfficialReceiptStatus[] = ["Active", "Approved", "Cancelled", "Closed", "Disapproved", "Draft", "Pending"];

  return statuses.includes(value as OfficialReceiptStatus) ? (value as OfficialReceiptStatus) : "Draft";
}
