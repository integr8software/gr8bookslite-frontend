import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  GoodsReceiptAccountingEntry,
  GoodsReceiptCopyRecord,
  GoodsReceiptFormValues,
  GoodsReceiptLineEntry,
  GoodsReceiptRecord,
  GoodsReceiptStatus,
  GoodsReceiptTotals,
} from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";

export const GoodsReceiptStorageKey = "gr8books.goods-receipt.records";

export const GoodsReceiptTransactionTypeOptions = [
  { name: "--Select Transaction Type--", value: "" },
  { name: "Goods Issue Return", value: "Goods Issue Return" },
  { name: "Sales Return", value: "Sales Return" },
  { name: "Stock Adjustment Receipt", value: "Stock Adjustment Receipt" },
  { name: "Variance", value: "Variance" },
];

export const GoodsReceiptCurrencyOptions = [
  { name: "PHP", value: "PHP" },
  { name: "USD", value: "USD" },
];

export const GoodsReceiptWarehouseOptions = [
  { name: "--Select Warehouse--", value: "" },
  { name: "Main Warehouse", value: "Main Warehouse" },
  { name: "Transit Warehouse", value: "Transit Warehouse" },
  { name: "Project Warehouse", value: "Project Warehouse" },
];

export const GoodsReceiptPartyOptions = [
  { name: "North Harbor Office Depot", value: "North Harbor Office Depot" },
  { name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
  { name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const GoodsReceiptUomOptions = [
  { name: "PCS", value: "PCS" },
  { name: "BOX", value: "BOX" },
  { name: "PACK", value: "PACK" },
];

export const GoodsReceiptResponsibilityCenterOptions = [
  { name: "CC-INV-001", value: "CC-INV-001" },
  { name: "CC-OPS-001", value: "CC-OPS-001" },
  { name: "CC-ADM-001", value: "CC-ADM-001" },
];

export const GoodsReceiptStatusOptions = [
  { name: "Draft", value: "Draft" },
  { name: "For Approval", value: "For Approval" },
  { name: "Posted", value: "Posted" },
  { name: "Disapproved", value: "Disapproved" },
  { name: "Cancelled", value: "Cancelled" },
];

export const GoodsReceiptCopyRecords: GoodsReceiptCopyRecord[] = [
  {
    amount: "18450.00",
    documentDate: "2026-07-16",
    id: "gi-return-001",
    itemCategory: "Supplies",
    itemCode: "ITEM-001",
    itemName: "Returned office supplies",
    partyCode: "VCE-001",
    partyName: "North Harbor Office Depot",
    receivedQuantity: "18.00",
    remarks: "Goods issue return for unused office supplies.",
    source: "Goods Issue",
    sourceNo: "GI-2026-0001",
    uom: "PCS",
    warehouse: "Main Warehouse",
  },
  {
    amount: "62500.00",
    documentDate: "2026-07-12",
    id: "si-return-001",
    itemCategory: "Consumables",
    itemCode: "ITEM-002",
    itemName: "Sales return consumables",
    partyCode: "VCE-002",
    partyName: "Aster Foods Corporation",
    receivedQuantity: "8.00",
    remarks: "Sales return received back to warehouse.",
    source: "Sales Invoice",
    sourceNo: "SI-2026-0008",
    uom: "BOX",
    warehouse: "Transit Warehouse",
  },
  {
    amount: "93800.00",
    documentDate: "2026-07-08",
    id: "ic-variance-001",
    itemCategory: "Inventory",
    itemCode: "ITEM-003",
    itemName: "Inventory count positive variance",
    partyCode: "VCE-003",
    partyName: "Harborview Logistics",
    receivedQuantity: "12.00",
    remarks: "Inventory count adjustment receipt.",
    source: "Inventory Count",
    sourceNo: "IC-2026-0014",
    uom: "PCS",
    warehouse: "Project Warehouse",
  },
];

export const MockGoodsReceipts: GoodsReceiptRecord[] = [
  {
    id: "gr-001",
    documentDate: "2026-07-16",
    referenceNo: "GI-2026-0001",
    status: "Posted",
    totalAmount: 18450,
    transactionNo: "GR-2026-0001",
    transactionType: "Goods Issue Return",
    vceName: "North Harbor Office Depot",
  },
  {
    id: "gr-002",
    documentDate: "2026-07-12",
    referenceNo: "IC-2026-0014",
    status: "For Approval",
    totalAmount: 62500,
    transactionNo: "GR-2026-0002",
    transactionType: "Sales Return",
    vceName: "Aster Foods Corporation",
  },
  {
    id: "gr-003",
    documentDate: "2026-07-08",
    referenceNo: "SI-2026-0008",
    status: "Posted",
    totalAmount: 93800,
    transactionNo: "GR-2026-0003",
    transactionType: "Stock Adjustment Receipt",
    vceName: "Harborview Logistics",
  },
];

export function createBlankGoodsReceiptLineEntry(
  overrides: Partial<GoodsReceiptLineEntry> = {},
): GoodsReceiptLineEntry {
  return {
    id: `gr-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemCode: "",
    barcode: "",
    itemName: "",
    itemCategory: "",
    uom: "PCS",
    lotNo: "",
    stockQuantity: "0.00",
    receivedQuantity: "0.00",
    unitCost: "0.00",
    amount: "0.00",
    referenceNo: "",
    responsibilityCenter: "",
    ...overrides,
  };
}

export function createBlankGoodsReceiptAccountingEntry(
  overrides: Partial<GoodsReceiptAccountingEntry> = {},
): GoodsReceiptAccountingEntry {
  return {
    id: `gr-accounting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountCode: "",
    accountTitle: "",
    debit: 0,
    credit: 0,
    partyCode: "",
    partyName: "",
    particulars: "",
    vatType: "",
    atcCode: "",
    responsibilityCenter: "",
    refNo: "",
    ...overrides,
  };
}

export function createGoodsReceiptAccountingEntries(
  values: Pick<GoodsReceiptFormValues, "transactionNo" | "vceCode" | "vceName">,
): GoodsReceiptAccountingEntry[] {
  return [
    createBlankGoodsReceiptAccountingEntry({
      accountTitle: "Inventory",
      debit: 0,
      partyCode: values.vceCode,
      partyName: values.vceName,
      particulars: values.transactionNo,
      refNo: values.transactionNo,
    }),
    createBlankGoodsReceiptAccountingEntry({
      accountTitle: "Accrued Payable",
      credit: 0,
      partyCode: values.vceCode,
      partyName: values.vceName,
      particulars: values.transactionNo,
      refNo: values.transactionNo,
    }),
  ];
}

export function createGoodsReceiptFormValues(): GoodsReceiptFormValues {
  const today = new Date().toISOString().slice(0, 10);
  const transactionNo = "GR-2026-0004";

  return {
    transactionType: "",
    sourceWarehouse: "",
    receivingWarehouse: "",
    vceCode: "",
    vceName: "",
    currency: "PHP",
    exchangeRate: "1.0000",
    remarks: "",
    transactionNo,
    documentDate: today,
    status: "Draft",
    icNo: "",
    giNo: "",
    siRef: "",
    projectRef: "",
    projectName: "",
    accountingEntries: createGoodsReceiptAccountingEntries({
      transactionNo,
      vceCode: "",
      vceName: "",
    }),
    lineEntries: [createBlankGoodsReceiptLineEntry()],
  };
}

export function createGoodsReceiptFormValuesFromRecord(
  record: GoodsReceiptRecord,
): GoodsReceiptFormValues {
  if (record.formValues) {
    const defaults = createGoodsReceiptFormValues();

    return {
      ...defaults,
      ...record.formValues,
      receivingWarehouse: record.formValues.receivingWarehouse ?? "",
      status: normalizeGoodsReceiptStatus(record.formValues.status),
      accountingEntries: (
        record.formValues.accountingEntries ?? defaults.accountingEntries
      ).map((entry) => ({
        ...createBlankGoodsReceiptAccountingEntry(),
        ...entry,
      })),
      lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
    };
  }

  return {
    ...createGoodsReceiptFormValues(),
    transactionNo: record.transactionNo,
    transactionType: record.transactionType,
    documentDate: record.documentDate,
    status: normalizeGoodsReceiptStatus(record.status),
    vceName: record.vceName,
    accountingEntries: createGoodsReceiptAccountingEntries({
      transactionNo: record.transactionNo,
      vceCode: "",
      vceName: record.vceName,
    }),
    icNo: record.referenceNo.startsWith("IC") ? record.referenceNo : "",
    giNo: record.referenceNo.startsWith("GI") ? record.referenceNo : "",
    siRef: record.referenceNo.startsWith("SI") ? record.referenceNo : "",
    lineEntries: [
      createBlankGoodsReceiptLineEntry({
        itemCode: "ITEM-001",
        itemName: "Received inventory item",
        itemCategory: "Supplies",
        receivedQuantity: "1.00",
        unitCost: record.totalAmount.toFixed(2),
        amount: record.totalAmount.toFixed(2),
        referenceNo: record.referenceNo,
      }),
    ],
  };
}

export function createGoodsReceiptRecordFromForm(
  values: GoodsReceiptFormValues,
  existingRecord?: GoodsReceiptRecord,
): GoodsReceiptRecord {
  const totals = calculateGoodsReceiptTotals(values.lineEntries);

  return {
    id: existingRecord?.id ?? `gr-${Date.now()}`,
    documentDate: values.documentDate,
    formValues: {
      ...values,
      accountingEntries: values.accountingEntries.map((entry) => ({ ...entry })),
      lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
    },
    referenceNo: values.icNo || values.giNo || values.siRef,
    status: normalizeGoodsReceiptStatus(values.status),
    totalAmount: totals.amount,
    transactionNo: values.transactionNo,
    transactionType: values.transactionType,
    vceName: values.vceName,
  };
}

export function calculateGoodsReceiptTotals(entries: GoodsReceiptLineEntry[]): GoodsReceiptTotals {
  return entries.reduce(
    (summary, entry) => ({
      amount: summary.amount + parseMoneyNumberInput(entry.amount),
      receivedQuantity: summary.receivedQuantity + parseMoneyNumberInput(entry.receivedQuantity),
    }),
    { amount: 0, receivedQuantity: 0 },
  );
}

export function getInitialGoodsReceipts() {
  return readStoredGoodsReceipts() ?? MockGoodsReceipts;
}

export function readStoredGoodsReceipts() {
  if (typeof window === "undefined") return null;

  const storedRecords = window.localStorage.getItem(GoodsReceiptStorageKey);
  if (!storedRecords) return null;

  try {
    const parsedRecords = JSON.parse(storedRecords) as GoodsReceiptRecord[];
    return Array.isArray(parsedRecords)
      ? parsedRecords.map(normalizeStoredGoodsReceiptRecord)
      : null;
  } catch {
    return null;
  }
}

export function writeStoredGoodsReceipts(records: GoodsReceiptRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GoodsReceiptStorageKey, JSON.stringify(records));
}

export function formatGoodsReceiptDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatGoodsReceiptCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amount);
}

export function formatGoodsReceiptAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function countGoodsReceiptsByStatus(
  records: GoodsReceiptRecord[],
  status: GoodsReceiptStatus,
) {
  return records.filter((record) => record.status === status).length;
}

export function formatGoodsReceiptPercentage(value: number, total: number) {
  return total === 0 ? "0.00% of total" : `${((value / total) * 100).toFixed(2)}% of total`;
}

export function goodsReceiptEntryHasData(entry: GoodsReceiptLineEntry) {
  return (
    entry.itemCode.trim() !== "" ||
    entry.itemName.trim() !== "" ||
    entry.referenceNo.trim() !== "" ||
    parseMoneyNumberInput(entry.receivedQuantity) > 0 ||
    parseMoneyNumberInput(entry.amount) > 0
  );
}

export function goodsReceiptEntryIsComplete(entry: GoodsReceiptLineEntry) {
  return entry.itemCode.trim() !== "" && parseMoneyNumberInput(entry.receivedQuantity) > 0;
}

function normalizeGoodsReceiptStatus(value: string): GoodsReceiptStatus {
  if (value === "Active" || value === "Approved" || value === "Closed") {
    return "Posted";
  }

  if (value === "Pending") {
    return "For Approval";
  }

  const statuses: GoodsReceiptStatus[] = [
    "Cancelled",
    "Disapproved",
    "Draft",
    "For Approval",
    "Posted",
  ];

  return statuses.includes(value as GoodsReceiptStatus) ? (value as GoodsReceiptStatus) : "Draft";
}

function normalizeStoredGoodsReceiptRecord(record: GoodsReceiptRecord): GoodsReceiptRecord {
  const status = normalizeGoodsReceiptStatus(record.status);

  return {
    ...record,
    formValues: record.formValues
      ? {
          ...record.formValues,
          status: normalizeGoodsReceiptStatus(record.formValues.status),
        }
      : record.formValues,
    status,
  };
}
