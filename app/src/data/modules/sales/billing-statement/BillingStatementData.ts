import { BillingStatementStorageKey } from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import type {
  BillingStatementAccountingEntry,
  BillingStatementFormValues,
  BillingStatementItem,
  BillingStatementRecord,
  BillingStatementStatus,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";

export const emptyBillingStatementItem: BillingStatementItem = {
  id: "draft-item",
  description: "",
  particulars: "",
  amount: 0,
  quantity: 0,
  netAmount: 0,
  vatAmount: 0,
  wvatAmount: 0,
  ewtAmount: 0,
  discountPercent: "",
  discountAmount: 0,
  grossAmount: 0,
  vatType: "",
  vatable: "False",
  vatInclusive: "False",
  withWvat: "False",
  wvatType: "0.00",
  withEwt: "False",
  ewtType: "0.00",
  responsibilityCenter: "",
};

export const billingStatementSeedRecords: BillingStatementRecord[] = [
  {
    id: "bs-000001",
    code: "CUST0001",
    name: "Sample Customer",
    currency: "PHP",
    exchangeRate: 1,
    contactPerson: "",
    remarks: "",
    terms: "Net 30",
    dueDate: "2026-08-07",
    description: "Professional Services",
    defaultAccount: "Accounts Receivable",
    teamAssigned: "--Select Terms--",
    startDate: "2026-08-07",
    expirationDate: "2026-08-07",
    netAmount: 0,
    vatAmount: 0,
    wvatAmount: 0,
    ewtAmount: 0,
    discountAmount: 0,
    grossAmount: 0,
    salesAssociate: "",
    resCustomerCode: "",
    resCustomer: "",
    recoupment: 0,
    retention: 0,
    donation: 0,
    transNo: "000001",
    documentDate: "2026-08-07",
    sjNo: "",
    joNo: "",
    poNo: "",
    sqNo: "",
    invoiceNo: "",
    refNo: "",
    businessStyle: "",
    status: "Draft",
    projectRef: "",
    projectName: "",
    attachments: [],
    accountingEntries: [createBlankBillingStatementAccountingEntry()],
    items: [{ ...emptyBillingStatementItem, id: "bs-000001-item-1" }],
  },
];

export function createBillingStatementFormValues(
  record?: BillingStatementRecord,
): BillingStatementFormValues {
  if (record) {
    const normalizedRecord = normalizeBillingStatementRecordDefaults(record);

    return {
      ...normalizedRecord,
      attachments: normalizedRecord.attachments.map((attachment) => ({ ...attachment })),
      accountingEntries: normalizedRecord.accountingEntries.map((entry) => ({ ...entry })),
      items: normalizedRecord.items.map((item) => ({ ...item })),
    };
  }

  const transNo = createNextBillingStatementNo(billingStatementSeedRecords);
  const today = new Date().toISOString().slice(0, 10);

  return {
    code: "",
    name: "",
    currency: "PHP",
    exchangeRate: 1,
    contactPerson: "",
    remarks: "",
    terms: "--Select Terms--",
    dueDate: today,
    description: "--Select Description--",
    defaultAccount: "--Select Debit Account--",
    teamAssigned: "--Select Terms--",
    startDate: today,
    expirationDate: today,
    netAmount: 0,
    vatAmount: 0,
    wvatAmount: 0,
    ewtAmount: 0,
    discountAmount: 0,
    grossAmount: 0,
    salesAssociate: "",
    resCustomerCode: "",
    resCustomer: "",
    recoupment: 0,
    retention: 0,
    donation: 0,
    transNo,
    documentDate: today,
    sjNo: "",
    joNo: "",
    poNo: "",
    sqNo: "",
    invoiceNo: "",
    refNo: "",
    businessStyle: "",
    status: "Draft",
    projectRef: "",
    projectName: "",
    attachments: [],
    accountingEntries: [createBlankBillingStatementAccountingEntry({ refNo: transNo })],
    items: [createBlankBillingStatementItem()],
  };
}

export function createBillingStatementRecord(
  values: BillingStatementFormValues,
  id = createBillingStatementId("bs"),
): BillingStatementRecord {
  const items = values.items.map(normalizeBillingStatementItem);
  const totals = calculateBillingStatementTotals(items);

  return {
    id,
    ...values,
    status: normalizeBillingStatementStatus(values.status),
    ...totals,
    attachments: values.attachments.map((attachment) => ({ ...attachment })),
    exchangeRate: Number(values.exchangeRate) || 1,
    recoupment: Number(values.recoupment) || 0,
    retention: Number(values.retention) || 0,
    donation: Number(values.donation) || 0,
    accountingEntries: values.accountingEntries.map((entry) => ({
      ...createBlankBillingStatementAccountingEntry(),
      ...entry,
      credit: Number(entry.credit) || 0,
      debit: Number(entry.debit) || 0,
    })),
    items,
  };
}

export function createBlankBillingStatementItem() {
  return {
    ...emptyBillingStatementItem,
    id: createBillingStatementId("item"),
  };
}

export function createBlankBillingStatementAccountingEntry(
  entry: Partial<BillingStatementAccountingEntry> = {},
): BillingStatementAccountingEntry {
  return {
    id: createBillingStatementId("accounting"),
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

export function calculateBillingStatementTotals(items: BillingStatementItem[]) {
  return items.reduce(
    (totals, item) => ({
      discountAmount: totals.discountAmount + Number(item.discountAmount || 0),
      ewtAmount: totals.ewtAmount + Number(item.ewtAmount || 0),
      grossAmount: totals.grossAmount + Number(item.grossAmount || 0),
      netAmount: totals.netAmount + Number(item.netAmount || 0),
      vatAmount: totals.vatAmount + Number(item.vatAmount || 0),
      wvatAmount: totals.wvatAmount + Number(item.wvatAmount || 0),
    }),
    {
      discountAmount: 0,
      ewtAmount: 0,
      grossAmount: 0,
      netAmount: 0,
      vatAmount: 0,
      wvatAmount: 0,
    },
  );
}

export function formatBillingStatementCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatBillingStatementMoney(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amount);
}

export function formatBillingStatementDate(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function countBillingStatementsByStatus(
  records: BillingStatementRecord[],
  status: BillingStatementStatus,
) {
  return records.filter((record) => record.status === status).length;
}

export function isBillingStatementActiveStatus(status: BillingStatementStatus) {
  return status === "For Approval" || status === "Posted";
}

export function formatBillingStatementPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function loadBillingStatements() {
  if (typeof window === "undefined") {
    return billingStatementSeedRecords;
  }

  try {
    const stored = window.localStorage.getItem(BillingStatementStorageKey);

    if (!stored) {
      return billingStatementSeedRecords;
    }

    const parsed = JSON.parse(stored) as BillingStatementRecord[];
    const records =
      Array.isArray(parsed) && parsed.length > 0 ? parsed : billingStatementSeedRecords;

    return records.map(normalizeBillingStatementRecordDefaults);
  } catch {
    return billingStatementSeedRecords;
  }
}

export function saveBillingStatements(records: BillingStatementRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BillingStatementStorageKey, JSON.stringify(records));
}

export function createNextBillingStatementNo(records: BillingStatementRecord[]) {
  const nextNumber =
    records.reduce((highest, record) => {
      const numeric = Number.parseInt(record.transNo, 10);
      return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
    }, 0) + 1;

  return nextNumber.toString().padStart(6, "0");
}

export function createBillingStatementId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeBillingStatementRecordDefaults(
  record: Partial<BillingStatementRecord>,
): BillingStatementRecord {
  const fallback = createBillingStatementFormValues();
  const items = (record.items ?? fallback.items).map(normalizeBillingStatementItem);
  const totals = calculateBillingStatementTotals(items);

  return {
    id: record.id ?? createBillingStatementId("bs"),
    ...fallback,
    ...record,
    ...totals,
    exchangeRate: Number(record.exchangeRate) || 1,
    recoupment: Number(record.recoupment) || 0,
    retention: Number(record.retention) || 0,
    donation: Number(record.donation) || 0,
    status: normalizeBillingStatementStatus(record.status),
    attachments: record.attachments?.map((attachment) => ({ ...attachment })) ?? fallback.attachments,
    accountingEntries:
      record.accountingEntries?.map((entry) =>
        createBlankBillingStatementAccountingEntry({
          ...entry,
          credit: Number(entry.credit) || 0,
          debit: Number(entry.debit) || 0,
        }),
      ) ?? fallback.accountingEntries,
    items,
  };
}

function normalizeBillingStatementItem(item: Partial<BillingStatementItem>) {
  const amount = Number(item.amount) || 0;
  const quantity = Number(item.quantity) || 0;
  const discountAmount = Number(item.discountAmount) || 0;
  const grossAmount = Number(item.grossAmount) || amount * quantity;

  return {
    ...emptyBillingStatementItem,
    ...item,
    id: item.id || createBillingStatementId("item"),
    amount,
    quantity,
    discountAmount,
    grossAmount,
    netAmount: Number(item.netAmount) || Math.max(grossAmount - discountAmount, 0),
    vatAmount: Number(item.vatAmount) || 0,
    wvatAmount: Number(item.wvatAmount) || 0,
    ewtAmount: Number(item.ewtAmount) || 0,
  };
}

function normalizeBillingStatementStatus(status: unknown): BillingStatementStatus {
  const value = String(status ?? "");

  if (
    value === "Cancelled" ||
    value === "Disapproved" ||
    value === "Draft" ||
    value === "For Approval" ||
    value === "Posted"
  ) {
    return value;
  }

  if (value === "Active" || value === "Approved" || value === "Closed") {
    return "Posted";
  }

  if (value === "Pending") {
    return "For Approval";
  }

  return "Draft";
}
