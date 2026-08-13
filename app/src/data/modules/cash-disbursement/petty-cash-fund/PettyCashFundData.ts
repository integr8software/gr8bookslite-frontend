import {
  PettyCashFundStatuses,
  PettyCashFundStorageKey,
  PettyCashFundTransactionPrefix,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundFormValues,
  PettyCashFundItem,
  PettyCashFundRecord,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { todayDateValue } from "@/app/src/utils/date.util";

export const PettyCashFundPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "E000102", name: "ARSICOLO, RAYMARK B", value: "E000102" },
  { label: "E000117", name: "DELA CRUZ, MARIA L", value: "E000117" },
  { label: "E000145", name: "SANTOS, JOSE P", value: "E000145" },
];
export const PettyCashFundAccountOptions: AppAdvancedDropdownOption[] = [
  { label: "101-200", name: "Petty Cash Fund", value: "101-200" },
  { label: "101-210", name: "Cash on Hand", value: "101-210" },
];
export const PettyCashFundProjectOptions: AppAdvancedDropdownOption[] = [
  { label: "PRJ-001", name: "Main Office Operations", value: "PRJ-001" },
  { label: "PRJ-002", name: "Branch Expansion", value: "PRJ-002" },
];
export const PettyCashFundResponsibilityCenterOptions = ["Administration", "Operations", "Sales"];

const seedRecords: PettyCashFundRecord[] = [
  createSeed("1", "PCF-000063", "2026-02-23", "E000102", "ARSICOLO, RAYMARK B", 120, "Initial petty cash fund", "For Approval"),
  createSeed("2", "PCF-000062", "2026-02-18", "E000117", "DELA CRUZ, MARIA L", 15000, "Field operations fund", "Posted"),
  createSeed("3", "PCF-000061", "2026-02-12", "E000145", "SANTOS, JOSE P", 8500, "Branch petty cash", "Draft"),
];

export function createBlankPettyCashFundItem(): PettyCashFundItem {
  return {
    id: `pcf-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: todayDateValue(),
    payeeCode: "",
    payeeName: "",
    orNo: "",
    tinNo: "",
    particulars: "",
    amount: "",
    netAmount: "",
    vatAmount: "0.00",
    type: "",
    vatType: "",
    vatable: "False",
    vatInclusive: "False",
    grossAmount: "",
    responsibilityCenter: "",
  };
}

export function createPettyCashFundFormValues(record?: PettyCashFundRecord): PettyCashFundFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      items: record.formValues.items.map((item) => ({ ...item })),
      attachments: record.formValues.attachments.map((item) => ({ ...item })),
    };
  }
  if (record) {
    const amount = formatMoneyNumberDisplayValue(String(record.amount));
    return {
      transactionNo: record.transactionNo,
      documentDate: record.documentDate,
      status: record.status,
      partyCode: record.partyCode,
      partyName: record.partyName,
      costCenter: "",
      currency: "PHP",
      exchangeRate: "1.0000",
      accountCode: record.accountCode,
      accountTitle: record.accountTitle,
      projectCode: "",
      projectName: "",
      remarks: record.remarks,
      items: [
        {
          ...createBlankPettyCashFundItem(),
          date: record.documentDate,
          payeeCode: "V100006",
          payeeName: "ALL4U RESTAURANT",
          tinNo: "488-860-327-000",
          amount,
          netAmount: amount,
          grossAmount: amount,
        },
      ],
      attachments: [],
    };
  }
  return {
    transactionNo: createNextPettyCashFundNumber(),
    documentDate: todayDateValue(),
    status: PettyCashFundStatuses.open,
    partyCode: "",
    partyName: "",
    costCenter: "",
    currency: "PHP",
    exchangeRate: "1.0000",
    accountCode: "",
    accountTitle: "",
    projectCode: "",
    projectName: "",
    remarks: "",
    items: [createBlankPettyCashFundItem()],
    attachments: [],
  };
}

export function calculatePettyCashFundTotals(items: PettyCashFundItem[]) {
  return items.reduce(
    (totals, item) => ({
      amount: totals.amount + parseMoneyNumberInput(item.amount),
      netAmount: totals.netAmount + parseMoneyNumberInput(item.netAmount),
      vatAmount: totals.vatAmount + parseMoneyNumberInput(item.vatAmount),
      grossAmount: totals.grossAmount + parseMoneyNumberInput(item.grossAmount),
    }),
    { amount: 0, netAmount: 0, vatAmount: 0, grossAmount: 0 },
  );
}

export function createPettyCashFundRecord(
  values: PettyCashFundFormValues,
  status: PettyCashFundStatus,
  existing?: PettyCashFundRecord,
): PettyCashFundRecord {
  const now = new Date().toISOString();
  const nextValues = {
    ...values,
    status,
    items: values.items.map((item) => ({ ...item })),
    attachments: values.attachments.map((item) => ({ ...item })),
  };
  return {
    id: existing?.id ?? `pcf-${values.transactionNo.toLowerCase()}`,
    transactionNo: values.transactionNo,
    documentDate: values.documentDate,
    partyCode: values.partyCode,
    partyName: values.partyName,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    amount: calculatePettyCashFundTotals(values.items).amount,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Current User",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Current User",
    updatedAt: now,
    formValues: nextValues,
  };
}

export function getPettyCashFundRecords() {
  if (typeof window === "undefined") return seedRecords;
  try {
    const stored = window.localStorage.getItem(PettyCashFundStorageKey);
    return stored ? (JSON.parse(stored) as PettyCashFundRecord[]) : seedRecords;
  } catch {
    return seedRecords;
  }
}
export function writePettyCashFundRecords(records: PettyCashFundRecord[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(PettyCashFundStorageKey, JSON.stringify(records));
}
export function upsertPettyCashFundRecord(record: PettyCashFundRecord) {
  const records = getPettyCashFundRecords();
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records];
}
export function formatPettyCashFundAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}

function createNextPettyCashFundNumber() {
  const highest = getPettyCashFundRecords().reduce(
    (value, record) => Math.max(value, Number(record.transactionNo.match(/(\d+)$/)?.[1] ?? 0)),
    0,
  );
  return `${PettyCashFundTransactionPrefix}-${String(highest + 1).padStart(6, "0")}`;
}
function createSeed(
  id: string,
  transactionNo: string,
  documentDate: string,
  partyCode: string,
  partyName: string,
  amount: number,
  remarks: string,
  status: PettyCashFundStatus,
): PettyCashFundRecord {
  return {
    id,
    transactionNo,
    documentDate,
    partyCode,
    partyName,
    accountCode: "101-200",
    accountTitle: "Petty Cash Fund",
    amount,
    remarks,
    status,
    createdBy: "Maria Santos",
    createdAt: `${documentDate}T09:00:00`,
    updatedBy: "Maria Santos",
    updatedAt: `${documentDate}T09:00:00`,
  };
}
