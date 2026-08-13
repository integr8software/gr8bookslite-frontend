import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { CashSalesInvoiceStorageKey } from "@/app/src/constants/modules/sales/cash-sales-invoice/CashSalesInvoiceConstants";
import type {
  CashSalesInvoiceAccountingEntry,
  CashSalesInvoiceFormValues,
  CashSalesInvoiceLineEntry,
  CashSalesInvoiceRecord,
  CashSalesInvoiceStatus,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";

export const CashSalesInvoiceCurrencyOptions = [
  { name: "PHP", value: "PHP" },
  { name: "USD", value: "USD" },
];

export const CashSalesInvoicePartyOptions = [
  { label: "CUST-001", name: "North Harbor Office Depot", value: "North Harbor Office Depot" },
  { label: "CUST-002", name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
  { label: "CUST-003", name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const CashSalesInvoiceTermOptions = [
  { name: "--Select Terms--", value: "" },
  { name: "Cash", value: "Cash" },
  { name: "Due on receipt", value: "Due on receipt" },
  { name: "Net 7", value: "Net 7" },
];

export const CashSalesInvoiceWarehouseOptions = [
  { name: "--Select Warehouse--", value: "" },
  { name: "Main Warehouse", value: "Main Warehouse" },
  { name: "Showroom Stockroom", value: "Showroom Stockroom" },
];

export const CashSalesInvoiceDefaultAccountOptions = [
  { name: "--Select Debit Account--", value: "" },
  { name: "Cash on Hand", value: "Cash on Hand" },
  { name: "Cash in Bank", value: "Cash in Bank" },
  { name: "Accounts Receivable - Trade", value: "Accounts Receivable - Trade" },
];

export const CashSalesInvoiceResponsibilityCenterOptions = [
  { name: "--Select Res. Center--", value: "" },
  { name: "Head Office", value: "Head Office" },
  { name: "Sales Department", value: "Sales Department" },
  { name: "Showroom", value: "Showroom" },
];

export const CashSalesInvoiceStatusDropdownOptions = [
  { name: "Draft", value: "Draft" },
  { name: "Posted", value: "Posted" },
  { name: "Cancelled", value: "Cancelled" },
];

export const MockCashSalesInvoices: CashSalesInvoiceRecord[] = [
  {
    id: "csi-001",
    amount: 18450,
    customerCode: "CUST-001",
    customerName: "North Harbor Office Depot",
    documentDate: "2026-08-07",
    drNo: "DR-2026-0001",
    sjNo: "SJ-2026-0001",
    status: "Draft",
    transactionNo: "CSI-2026-0001",
  },
];

export function createBlankCashSalesInvoiceLineEntry(
  overrides: Partial<CashSalesInvoiceLineEntry> = {},
): CashSalesInvoiceLineEntry {
  return {
    id: `csi-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemCode: "",
    description: "",
    particulars: "",
    quantity: "1.00",
    uom: "PC",
    unitPrice: "0.00",
    grossAmount: "0.00",
    vatAmount: "0.00",
    ewtAmount: "0.00",
    discountAmount: "0.00",
    netAmount: "0.00",
    responsibilityCenter: "",
    ...overrides,
  };
}

export function createCashSalesInvoiceFormValues(): CashSalesInvoiceFormValues {
  const today = new Date().toISOString().slice(0, 10);
  const lineEntries = [createBlankCashSalesInvoiceLineEntry()];
  const values = {
    partyCode: "",
    partyName: "",
    currency: "PHP",
    exchangeRate: "1.0000",
    address: "",
    contactNo: "",
    remarks: "",
    terms: "",
    dueDate: "",
    responsibilityCenter: "",
    grossAmount: "0.00",
    vatAmount: "0.00",
    ewtAmount: "0.00",
    discountAmount: "0.00",
    netAmount: "0.00",
    warehouse: "",
    defaultAccount: "",
    transNo: "CSI-2026-0002",
    documentDate: today,
    sjNo: "",
    drNo: "",
    status: "Draft" as CashSalesInvoiceStatus,
    lineEntries,
  };

  return {
    ...values,
    accountingEntries: createCashSalesInvoiceAccountingEntries(values),
  };
}

export function createCashSalesInvoiceFormValuesFromRecord(
  record: CashSalesInvoiceRecord,
): CashSalesInvoiceFormValues {
  if (record.formValues) {
    return {
      ...createCashSalesInvoiceFormValues(),
      ...record.formValues,
      accountingEntries: record.formValues.accountingEntries.map((entry) => ({ ...entry })),
      lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
    };
  }

  const values = {
    ...createCashSalesInvoiceFormValues(),
    partyCode: record.customerCode,
    partyName: record.customerName,
    documentDate: record.documentDate,
    drNo: record.drNo,
    sjNo: record.sjNo,
    grossAmount: record.amount.toFixed(2),
    netAmount: record.amount.toFixed(2),
    status: record.status,
    transNo: record.transactionNo,
    lineEntries: [
      createBlankCashSalesInvoiceLineEntry({
        description: "Cash sale item",
        grossAmount: record.amount.toFixed(2),
        netAmount: record.amount.toFixed(2),
      }),
    ],
  };

  return {
    ...values,
    accountingEntries: createCashSalesInvoiceAccountingEntries(values),
  };
}

export function createCashSalesInvoiceRecordFromForm(
  values: CashSalesInvoiceFormValues,
  existingRecord?: CashSalesInvoiceRecord,
): CashSalesInvoiceRecord {
  const totals = calculateCashSalesInvoiceTotals(values.lineEntries);
  const amount = totals.grossAmount || parseMoneyNumberInput(values.grossAmount);

  return {
    id: existingRecord?.id ?? `csi-${Date.now()}`,
    amount,
    customerCode: values.partyCode,
    customerName: values.partyName,
    documentDate: values.documentDate,
    drNo: values.drNo,
    formValues: {
      ...values,
      lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
      accountingEntries: values.accountingEntries.map((entry) => ({ ...entry })),
    },
    sjNo: values.sjNo,
    status: normalizeCashSalesInvoiceStatus(values.status),
    transactionNo: values.transNo,
  };
}

export function calculateCashSalesInvoiceTotals(entries: CashSalesInvoiceLineEntry[]) {
  return entries.reduce(
    (summary, entry) => ({
      discountAmount: summary.discountAmount + parseMoneyNumberInput(entry.discountAmount),
      ewtAmount: summary.ewtAmount + parseMoneyNumberInput(entry.ewtAmount),
      grossAmount: summary.grossAmount + parseMoneyNumberInput(entry.grossAmount),
      netAmount: summary.netAmount + parseMoneyNumberInput(entry.netAmount),
      vatAmount: summary.vatAmount + parseMoneyNumberInput(entry.vatAmount),
    }),
    { discountAmount: 0, ewtAmount: 0, grossAmount: 0, netAmount: 0, vatAmount: 0 },
  );
}

export function createCashSalesInvoiceAccountingEntries({
  defaultAccount,
  lineEntries,
}: Pick<CashSalesInvoiceFormValues, "defaultAccount" | "lineEntries">): CashSalesInvoiceAccountingEntry[] {
  const totals = calculateCashSalesInvoiceTotals(lineEntries);

  return [
    createAccountingEntry({
      accountCode: "CASH",
      accountTitle: defaultAccount || "Cash on Hand",
      debit: totals.grossAmount,
      particulars: "Cash sales invoice",
    }),
    createAccountingEntry({
      accountCode: "SALES",
      accountTitle: "Sales Revenue",
      credit: totals.netAmount,
      particulars: "Cash sales invoice",
    }),
    createAccountingEntry({
      accountCode: "VAT-OUT",
      accountTitle: "Output VAT",
      credit: totals.vatAmount,
      particulars: "Cash sales invoice",
    }),
  ];
}

export function getInitialCashSalesInvoices() {
  return readStoredCashSalesInvoices() ?? MockCashSalesInvoices;
}

export function readStoredCashSalesInvoices() {
  if (typeof window === "undefined") return null;
  const storedRecords = window.localStorage.getItem(CashSalesInvoiceStorageKey);
  if (!storedRecords) return null;

  try {
    const parsedRecords = JSON.parse(storedRecords) as CashSalesInvoiceRecord[];
    return Array.isArray(parsedRecords)
      ? parsedRecords.map(normalizeStoredCashSalesInvoiceRecord)
      : null;
  } catch {
    return null;
  }
}

export function writeStoredCashSalesInvoices(records: CashSalesInvoiceRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CashSalesInvoiceStorageKey, JSON.stringify(records));
}

export function formatCashSalesInvoiceCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amount);
}

export function formatCashSalesInvoiceDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function countCashSalesInvoicesByStatus(
  records: CashSalesInvoiceRecord[],
  status: CashSalesInvoiceStatus,
) {
  return records.filter((record) => record.status === status).length;
}

export function formatCashSalesInvoicePercentage(value: number, total: number) {
  if (total === 0) return "0.00% of total";
  return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function cashSalesInvoiceEntryHasData(entry: CashSalesInvoiceLineEntry) {
  return (
    entry.itemCode.trim() !== "" ||
    entry.description.trim() !== "" ||
    entry.particulars.trim() !== "" ||
    parseMoneyNumberInput(entry.grossAmount) > 0 ||
    parseMoneyNumberInput(entry.netAmount) > 0
  );
}

function createAccountingEntry(
  entry: Partial<CashSalesInvoiceAccountingEntry> = {},
): CashSalesInvoiceAccountingEntry {
  return {
    id: `csi-account-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    ...entry,
  };
}

export function createBlankCashSalesInvoiceAccountingEntry(
  overrides: Partial<CashSalesInvoiceAccountingEntry> = {},
): CashSalesInvoiceAccountingEntry {
  return createAccountingEntry(overrides);
}

function normalizeCashSalesInvoiceStatus(value: string): CashSalesInvoiceStatus {
  if (value === "Posted" || value === "Cancelled" || value === "Draft") return value;
  if (value === "Active" || value === "Approved") return "Posted";
  return "Draft";
}

function normalizeStoredCashSalesInvoiceRecord(
  record: CashSalesInvoiceRecord,
): CashSalesInvoiceRecord {
  return {
    ...record,
    status: normalizeCashSalesInvoiceStatus(record.status),
  };
}
