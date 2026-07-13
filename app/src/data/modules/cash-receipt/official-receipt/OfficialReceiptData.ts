import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
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
    collectionType: "Customer payment",
    referenceNo: "SI-2026-0204",
    amount: 214300,
    status: "Closed",
  },
];

export const OfficialReceiptStorageKey =
  "gr8books.official-receipt.receipts";

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

export const OfficialReceiptCopyFromRecords = [
  {
    amount: "184,500.00",
    documentDate: "2026-07-08",
    id: "si-2026-0211",
    partyName: "Aster Foods Corporation",
    source: "Sales invoice",
    sourceNo: "SI-2026-0211",
  },
  {
    amount: "76,250.00",
    documentDate: "2026-07-04",
    id: "soa-2026-0042",
    partyName: "Northline Retail Group",
    source: "Statement of account",
    sourceNo: "SOA-2026-0042",
  },
];

export const OfficialReceiptCopySources = [
  "Sales invoice",
  "Statement of account",
];

export function createBlankOfficialReceiptLineEntry(
  overrides: Partial<OfficialReceiptLineEntry> = {},
): OfficialReceiptLineEntry {
  return {
    id: `or-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountCode: "",
    accountTitle: "",
    collectionType: "",
    customerName: "",
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
    paymentType: "",
    currency: "PHP",
    exchangeRate: "1.0000",
    status: "Draft",
    remarks: "",
    lineEntries: [
      createBlankOfficialReceiptLineEntry({
        accountCode: "1010",
        accountTitle: "Cash in Bank",
      }),
    ],
  };
}

export function createOfficialReceiptFormValuesFromRecord(
  record: OfficialReceiptRecord,
): OfficialReceiptFormValues {
  if (record.formValues) {
    return {
      ...record.formValues,
      lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
    };
  }

  return {
    ...createOfficialReceiptFormValues(),
    receiptNo: record.receiptNo,
    receiptDate: record.receiptDate,
    referenceNo: record.referenceNo,
    customerName: record.customerName,
    status: record.status,
    lineEntries: [
      createBlankOfficialReceiptLineEntry({
        collectionType: record.collectionType,
        customerName: record.customerName,
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
  if (typeof window === "undefined") {
    return null;
  }

  const storedReceipts = window.localStorage.getItem(OfficialReceiptStorageKey);

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
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    OfficialReceiptStorageKey,
    JSON.stringify(receipts),
  );
}

export function getInitialOfficialReceipts() {
  return readStoredOfficialReceipts() ?? MockOfficialReceipts;
}

export function calculateOfficialReceiptTotals(
  entries: OfficialReceiptLineEntry[],
): OfficialReceiptTotals {
  return entries.reduce(
    (summary, entry) => ({
      credit: summary.credit + parseMoneyNumberInput(entry.credit),
      debit: summary.debit + parseMoneyNumberInput(entry.debit),
      ewt: summary.ewt + parseMoneyNumberInput(entry.ewt),
      grossReceipt:
        summary.grossReceipt + parseMoneyNumberInput(entry.grossReceipt),
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

export function countOfficialReceiptsByStatus(
  receipts: OfficialReceiptRecord[],
  status: OfficialReceiptStatus,
) {
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
    (parseMoneyNumberInput(entry.grossReceipt) > 0 ||
      parseMoneyNumberInput(entry.debit) > 0 ||
      parseMoneyNumberInput(entry.credit) > 0)
  );
}

function normalizeOfficialReceiptStatus(value: string): OfficialReceiptStatus {
  const statuses: OfficialReceiptStatus[] = [
    "Active",
    "Approved",
    "Cancelled",
    "Closed",
    "Disapproved",
    "Draft",
    "Pending",
  ];

  return statuses.includes(value as OfficialReceiptStatus)
    ? (value as OfficialReceiptStatus)
    : "Draft";
}
