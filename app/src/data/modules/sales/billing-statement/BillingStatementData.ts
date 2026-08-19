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

  const transNo = "000001";
  const today = new Date().toISOString().slice(0, 10);

  return {
    code: "",
    name: "",
    currency: "PHP",
    exchangeRate: 1,
    contactPerson: "",
    remarks: "",
    terms: "",
    dueDate: today,
    description: "",
    defaultAccount: "Accounts Receivable - Trade",
    teamAssigned: "",
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
    accountingEntries: createBillingStatementAccountingEntries({
      defaultAccount: "Accounts Receivable - Trade",
      items: [createBlankBillingStatementItem()],
      refNo: transNo,
    }),
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
    accountingEntries: values.accountingEntries.map(normalizeBillingStatementAccountingEntry),
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

export function createBillingStatementAccountingEntries({
  defaultAccount,
  items,
  partyCode = "",
  partyName = "",
  refNo = "",
}: {
  defaultAccount: string;
  items: BillingStatementItem[];
  partyCode?: string;
  partyName?: string;
  refNo?: string;
}): BillingStatementAccountingEntry[] {
  const totals = calculateBillingStatementTotals(items);
  const receivableAmount = Math.max(0, totals.grossAmount);
  const discountAmount = Math.max(0, totals.discountAmount);
  const vatAmount = Math.max(0, totals.vatAmount);
  const serviceAmount = Math.max(0, receivableAmount + discountAmount - vatAmount);

  return [
    createBlankBillingStatementAccountingEntry({
      id: "accounts-receivable",
      accountCode: "AR-TRADE",
      accountTitle: defaultAccount || "Accounts Receivable - Trade",
      debit: receivableAmount,
      partyCode,
      partyName,
      refNo,
    }),
    createBlankBillingStatementAccountingEntry({
      id: "sales-discount",
      accountCode: "SALES-DISC",
      accountTitle: "Sales Discount",
      debit: discountAmount,
      partyCode,
      partyName,
      refNo,
    }),
    createBlankBillingStatementAccountingEntry({
      id: "output-tax",
      accountCode: "VAT-OUT",
      accountTitle: "Output Tax",
      credit: vatAmount,
      partyCode,
      partyName,
      refNo,
    }),
    createBlankBillingStatementAccountingEntry({
      id: "service-fees",
      accountCode: "SRV-FEE",
      accountTitle: "Service Fees",
      credit: serviceAmount,
      partyCode,
      partyName,
      refNo,
    }),
  ];
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
    accountingEntries: record.accountingEntries?.map(normalizeBillingStatementAccountingEntry) ?? fallback.accountingEntries,
    items,
  };
}

function normalizeBillingStatementItem(item: Partial<BillingStatementItem>) {
  const amount = Number(item.amount) || 0;
  const quantity = Number(item.quantity) || 0;
  const grossAmount =
    amount > 0 && quantity > 0 ? amount * quantity : Number(item.grossAmount) || amount * quantity;
  const discountPercent = Number(item.discountPercent) || 0;
  const discountAmount =
    grossAmount * (Math.max(discountPercent, 0) / 100);
  const grossAfterDiscount = Math.max(grossAmount - discountAmount, 0);
  const isVatable = String(item.vatable ?? "").toLowerCase() === "true";
  const isVatInclusive = isVatable && String(item.vatInclusive ?? "").toLowerCase() === "true";
  const vatAmount = !isVatable
    ? 0
    : isVatInclusive
      ? (grossAfterDiscount / 1.12) * 0.12
      : grossAfterDiscount * 0.12;
  const netAmount = isVatable && !isVatInclusive ? grossAfterDiscount + vatAmount : grossAfterDiscount;

  return {
    ...emptyBillingStatementItem,
    ...item,
    id: item.id || createBillingStatementId("item"),
    amount,
    quantity,
    discountAmount: roundMoney(discountAmount),
    grossAmount: roundMoney(grossAmount),
    netAmount: roundMoney(netAmount),
    vatAmount: roundMoney(vatAmount),
    wvatAmount: Number(item.wvatAmount) || 0,
    ewtAmount: Number(item.ewtAmount) || 0,
  };
}

function normalizeBillingStatementAccountingEntry(
  entry: BillingStatementAccountingEntry,
): BillingStatementAccountingEntry {
  return {
    ...createBlankBillingStatementAccountingEntry(),
    ...entry,
    credit: Number(entry.credit) || 0,
    debit: Number(entry.debit) || 0,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
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
