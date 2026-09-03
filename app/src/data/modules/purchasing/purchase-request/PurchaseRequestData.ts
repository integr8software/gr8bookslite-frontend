import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type {
  PurchaseRequestAccountingEntry,
  PurchaseRequestFormValues,
  PurchaseRequestItem,
  PurchaseRequestRecord,
  PurchaseRequestStatus,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

const DefaultPurchaseRequestPrintHeader = {
  companyAddress: "Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District",
  companyName: "Your Company Name Here",
  logoFileName: "",
  logoImageUrl: "",
  telephoneNo: "0967-237-4514",
  vatRegTin: "000-000-000-000",
};

export const emptyPurchaseRequestItem: PurchaseRequestItem = {
  id: "draft-item",
  itemId: "",
  serviceMaintenanceId: "",
  itemCode: "",
  barcode: "",
  description: "",
  uom: "PC",
  quantity: 1,
  lotNo: "",
  expiryDate: "",
  cost: 0,
  responsibilityCenter: "",
};

export function createBlankPurchaseRequestAccountingEntry(): PurchaseRequestAccountingEntry {
  return createPurchaseRequestAccountingEntry();
}

export const PurchaseRequestMaterialPlanRecords: Array<
  AppCopyFromRecord & {
  items: PurchaseRequestItem[];
  }
> = [];

export function createPurchaseRequestFormValues(record?: PurchaseRequestRecord): PurchaseRequestFormValues {
  if (record) {
    const normalizedRecord = normalizePurchaseRequestRecordDefaults(record);

    return {
      ...normalizedRecord,
      items: normalizedRecord.items.map((item) => ({ ...item })),
      accountingEntries: normalizedRecord.accountingEntries.map((entry) => ({ ...entry })),
    };
  }

  return {
    ...DefaultPurchaseRequestPrintHeader,
    vceCode: "",
    vceName: "",
    purchaseType: "Goods",
    transNo: createNextTransNo([]),
    prDate: new Date().toISOString().slice(0, 10),
    status: "Draft",
    currency: "PHP",
    exchangeRate: 1,
    bomNo: "",
    projectCode: "",
    projectName: "",
    vendorAddress: "",
    remarks: "",
    forDepartment: "",
    preparedBy: "",
    preparedByLabel: "Prepared by",
    preparedBySignatureFileName: "",
    preparedBySignatureImageUrl: "",
    approvedBy: "",
    approvedByLabel: "Approved by",
    approvedBySignatureFileName: "",
    approvedBySignatureImageUrl: "",
    accountingEntries: createPurchaseRequestAccountingEntries({
      refNo: createNextTransNo([]),
    }),
    items: [{ ...emptyPurchaseRequestItem, id: createPurchaseRequestId("item") }],
  };
}

export function createPurchaseRequestRecord(values: PurchaseRequestFormValues, id = createPurchaseRequestId("pr")): PurchaseRequestRecord {
  return {
    id,
    ...values,
    vatRegTin: FormatTinNumber(values.vatRegTin),
    status: normalizePurchaseRequestStatus(values.status),
    accountingEntries: (
      values.accountingEntries ??
      createPurchaseRequestAccountingEntries({
        partyCode: values.vceCode,
        partyName: values.vceName,
        refNo: values.transNo,
      })
    ).map((entry) => ({
      ...createBlankPurchaseRequestAccountingEntry(),
      ...entry,
      debit: Number(entry.debit) || 0,
      credit: Number(entry.credit) || 0,
    })),
    items: values.items.map((item) => ({
      ...item,
      id: item.id || createPurchaseRequestId("item"),
      quantity: Number(item.quantity) || 0,
      cost: Number(item.cost) || 0,
    })),
  };
}

export function getPurchaseRequestTotal(record: Pick<PurchaseRequestRecord, "items">) {
  return record.items.reduce((total, item) => total + getPurchaseRequestItemAmount(item), 0);
}

export function getPurchaseRequestItemAmount(item: PurchaseRequestItem) {
  return (Number(item.quantity) || 0) * (Number(item.cost) || 0);
}

export function formatPurchaseRequestCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPurchaseRequestMoney(amount: number, currency: string) {
  const symbol = getPurchaseRequestCurrencySymbol(currency);

  return `${symbol}${formatPurchaseRequestCurrency(amount)}`;
}

function getPurchaseRequestCurrencySymbol(currency: string) {
  const symbols: Record<string, string> = {
    EUR: "€",
    JPY: "¥",
    PHP: "₱",
    USD: "$",
  };

  if (symbols[currency]) {
    return symbols[currency];
  }

  switch (currency) {
    case "PHP":
      return "₱";
    case "USD":
      return "$";
    case "JPY":
      return "¥";
    case "EUR":
      return "€";
    default:
      return currency ? `${currency} ` : "";
  }
}

export function formatPurchaseRequestDate(value: string) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${month}/${day}/${year}`;
}

function createPurchaseRequestAccountingEntries({
  partyCode = "",
  partyName = "",
  refNo = "",
}: {
  partyCode?: string;
  partyName?: string;
  refNo?: string;
} = {}) {
  return [
    createPurchaseRequestAccountingEntry({
      accountTitle: "Purchase Request Clearing",
      debit: 0,
      particulars: "Purchase request accrual",
      refNo,
    }),
    createPurchaseRequestAccountingEntry({
      accountTitle: "Accounts Payable",
      credit: 0,
      partyCode,
      partyName,
      particulars: "Purchase request accrual",
      refNo,
    }),
  ];
}

function createPurchaseRequestAccountingEntry(entry: Partial<PurchaseRequestAccountingEntry> = {}): PurchaseRequestAccountingEntry {
  return {
    id: createPurchaseRequestId("accounting"),
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

function normalizePurchaseRequestRecordDefaults(record: Partial<PurchaseRequestRecord>): PurchaseRequestRecord {
  const transNo = record.transNo ?? createNextTransNo([]);

  return {
    id: record.id ?? createPurchaseRequestId("pr"),
    companyAddress: record.companyAddress ?? DefaultPurchaseRequestPrintHeader.companyAddress,
    companyName: record.companyName ?? DefaultPurchaseRequestPrintHeader.companyName,
    logoFileName: record.logoFileName ?? DefaultPurchaseRequestPrintHeader.logoFileName,
    logoImageUrl: record.logoImageUrl ?? DefaultPurchaseRequestPrintHeader.logoImageUrl,
    telephoneNo: record.telephoneNo ?? DefaultPurchaseRequestPrintHeader.telephoneNo,
    vatRegTin: record.vatRegTin ?? DefaultPurchaseRequestPrintHeader.vatRegTin,
    vceCode: record.vceCode ?? "",
    vceName: record.vceName ?? "",
    purchaseType: record.purchaseType ?? "Goods",
    transNo,
    prDate: record.prDate ?? new Date().toISOString().slice(0, 10),
    status: normalizePurchaseRequestStatus(record.status),
    currency: record.currency ?? "PHP",
    exchangeRate: Number(record.exchangeRate) || 1,
    bomNo: record.bomNo ?? "",
    projectCode: record.projectCode ?? "",
    projectName: record.projectName ?? "",
    vendorAddress: record.vendorAddress ?? "",
    remarks: record.remarks ?? "",
    forDepartment: record.forDepartment ?? "",
    preparedBy: record.preparedBy ?? "",
    preparedByLabel: record.preparedByLabel ?? "Prepared by",
    preparedBySignatureFileName: record.preparedBySignatureFileName ?? "",
    preparedBySignatureImageUrl: record.preparedBySignatureImageUrl ?? "",
    approvedBy: record.approvedBy ?? "",
    approvedByLabel: record.approvedByLabel ?? "Approved by",
    approvedBySignatureFileName: record.approvedBySignatureFileName ?? "",
    approvedBySignatureImageUrl: record.approvedBySignatureImageUrl ?? "",
    accountingEntries:
      record.accountingEntries?.map((entry) =>
        createPurchaseRequestAccountingEntry({
          ...entry,
          debit: Number(entry.debit) || 0,
          credit: Number(entry.credit) || 0,
        }),
      ) ??
      createPurchaseRequestAccountingEntries({
        partyCode: record.vceCode ?? "",
        partyName: record.vceName ?? "",
        refNo: transNo,
      }),
    items: (record.items ?? [{ ...emptyPurchaseRequestItem }]).map((item) => ({
      ...emptyPurchaseRequestItem,
      ...item,
      id: item.id || createPurchaseRequestId("item"),
      quantity: Number(item.quantity) || 0,
      cost: Number(item.cost) || 0,
    })),
  };
}

function normalizePurchaseRequestStatus(status: unknown): PurchaseRequestStatus {
  const value = String(status ?? "");

  if (value === "Draft" || value === "For Approval" || value === "Posted" || value === "Disapproved" || value === "Cancelled") {
    return value;
  }

  if (value === "Open") return "For Approval";
  if (value === "Approved" || value === "Closed") return "Posted";

  return "Draft";
}

export function createNextTransNo(records: PurchaseRequestRecord[]) {
  const nextNumber =
    records.reduce((highest, record) => {
      const numeric = Number.parseInt(record.transNo, 10);

      return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
    }, 291) + 1;

  return nextNumber.toString().padStart(6, "0");
}

export function createPurchaseRequestId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
