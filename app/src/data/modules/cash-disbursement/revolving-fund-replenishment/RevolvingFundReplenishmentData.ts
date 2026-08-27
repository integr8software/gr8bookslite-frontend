import { RevolvingFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  RevolvingFundReplenishmentEntry,
  RevolvingFundReplenishmentFormValues,
  RevolvingFundReplenishmentRecord,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { todayDateValue } from "@/app/src/utils/date.util";

export const RevolvingFundReplenishmentSeedRecords: RevolvingFundReplenishmentRecord[] = [
  createSeed(
    "1",
    "RFR-000063",
    "2026-02-23",
    "E000102",
    "Raymark B. Arsicolo",
    12500,
    "February office replenishment",
    RevolvingFundReplenishmentStatuses.forApproval,
  ),
  createSeed(
    "2",
    "RFR-000062",
    "2026-02-18",
    "E000117",
    "Maria L. Dela Cruz",
    15000,
    "Field operations replenishment",
    RevolvingFundReplenishmentStatuses.posted,
  ),
  createSeed(
    "3",
    "RFR-000061",
    "2026-02-12",
    "E000145",
    "Jose P. Santos",
    8500,
    "Branch replenishment",
    RevolvingFundReplenishmentStatuses.draft,
  ),
  createSeed(
    "4",
    "RFR-000060",
    "2026-02-08",
    "E000117",
    "Maria L. Dela Cruz",
    4200,
    "Office expense replenishment",
    RevolvingFundReplenishmentStatuses.disapproved,
  ),
  createSeed(
    "5",
    "RFR-000059",
    "2026-02-02",
    "E000102",
    "Raymark B. Arsicolo",
    3000,
    "Cancelled replenishment",
    RevolvingFundReplenishmentStatuses.cancelled,
  ),
];

export function createBlankRevolvingFundReplenishmentEntry(): RevolvingFundReplenishmentEntry {
  return {
    id: `rfr-entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    revolvingFundDate: todayDateValue(),
    revolvingFundNo: "",
    supplierCode: "",
    supplierName: "",
    amount: "",
    netAmount: "",
    vatType: "",
    vatPercent: "",
    vatAmount: "",
    ewtCode: "",
    ewtPercent: "",
    ewtAmount: "",
    totalAmountDue: "",
    remarks: "",
  };
}

export function createRevolvingFundReplenishmentFormValues(
  record?: RevolvingFundReplenishmentRecord,
  transactionNo = "RFR-000001",
  baseCurrencyCode = "PHP",
): RevolvingFundReplenishmentFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      entries: record.formValues.entries.map(normalizeRevolvingFundReplenishmentEntry),
      attachments: record.formValues.attachments.map((attachment) => ({ ...attachment })),
    };
  }
  if (record) {
    const amount = formatRevolvingFundReplenishmentAmount(record.amount);
    return {
      transactionNo: record.transactionNo,
      documentDate: record.documentDate,
      status: record.status,
      partyCode: record.partyCode,
      partyName: record.partyName,
      responsibilityCenter: "Administration",
      responsibilityCenterCode: "RC-ADM",
      projectCode: "",
      projectName: "",
      accountCode: record.accountCode,
      accountTitle: record.accountTitle,
      currency: baseCurrencyCode,
      exchangeRate: "1.00",
      remarks: record.remarks,
      entries: [
        {
          ...createBlankRevolvingFundReplenishmentEntry(),
          revolvingFundDate: record.documentDate,
          revolvingFundNo: "RFV-000084",
          supplierCode: record.partyCode,
          supplierName: record.partyName,
          amount,
          ...calculateRevolvingFundReplenishmentEntryTaxFields(amount),
          remarks: record.remarks,
        },
      ],
      attachments: [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: RevolvingFundReplenishmentStatuses.open,
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    responsibilityCenterCode: "",
    projectCode: "",
    projectName: "",
    accountCode: "",
    accountTitle: "",
    currency: baseCurrencyCode,
    exchangeRate: "1.00",
    remarks: "",
    entries: [createBlankRevolvingFundReplenishmentEntry()],
    attachments: [],
  };
}

export function calculateRevolvingFundReplenishmentTotals(entries: RevolvingFundReplenishmentEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      totalAmount: totals.totalAmount + parseMoneyNumberInput(entry.amount),
      netAmount: totals.netAmount + parseMoneyNumberInput(entry.netAmount),
      vatAmount: totals.vatAmount + parseMoneyNumberInput(entry.vatAmount),
      ewtAmount: totals.ewtAmount + parseMoneyNumberInput(entry.ewtAmount),
      totalAmountDue: totals.totalAmountDue + parseMoneyNumberInput(entry.totalAmountDue),
    }),
    { totalAmount: 0, netAmount: 0, vatAmount: 0, ewtAmount: 0, totalAmountDue: 0 },
  );
}

export function createRevolvingFundReplenishmentRecord(
  values: RevolvingFundReplenishmentFormValues,
  status: RevolvingFundReplenishmentStatus,
  existing?: RevolvingFundReplenishmentRecord,
): RevolvingFundReplenishmentRecord {
  const now = new Date().toISOString();
  const nextValues = {
    ...values,
    status,
    entries: values.entries.map((entry) => ({ ...entry })),
    attachments: values.attachments.map((attachment) => ({ ...attachment })),
  };
  return {
    id: existing?.id ?? `rfr-${values.transactionNo.toLowerCase()}`,
    transactionNo: values.transactionNo,
    documentDate: values.documentDate,
    partyCode: values.partyCode,
    partyName: values.partyName,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    amount: calculateRevolvingFundReplenishmentTotals(values.entries).totalAmount,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Current User",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Current User",
    updatedAt: now,
    formValues: nextValues,
  };
}

export function formatRevolvingFundReplenishmentAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}

export function calculateRevolvingFundReplenishmentEntryTaxFields(
  amountValue: string | number,
  vatType = "",
  ewtCode = "",
): Pick<
  RevolvingFundReplenishmentEntry,
  "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "totalAmountDue"
> {
  const amount = roundRevolvingFundReplenishmentTaxAmount(parseMoneyNumberInput(amountValue));
  const vatPercent = getRevolvingFundReplenishmentVatPercent(vatType);
  const ewtPercent = getRevolvingFundReplenishmentEwtPercent(ewtCode);
  const vatAmount = roundRevolvingFundReplenishmentTaxAmount((amount * vatPercent) / 100);
  const ewtAmount = roundRevolvingFundReplenishmentTaxAmount((amount * ewtPercent) / 100);

  return {
    netAmount: formatRevolvingFundReplenishmentAmount(Math.max(amount - vatAmount, 0)),
    vatPercent: vatPercent ? `${formatRevolvingFundReplenishmentAmount(vatPercent)}%` : "",
    vatAmount: formatRevolvingFundReplenishmentAmount(vatAmount),
    ewtPercent: ewtPercent ? `${formatRevolvingFundReplenishmentAmount(ewtPercent)}%` : "",
    ewtAmount: formatRevolvingFundReplenishmentAmount(ewtAmount),
    totalAmountDue: formatRevolvingFundReplenishmentAmount(Math.max(amount - ewtAmount, 0)),
  };
}

function normalizeRevolvingFundReplenishmentEntry(
  entry: Partial<RevolvingFundReplenishmentEntry> & {
    accountCode?: string;
    accountTitle?: string;
    totalAmount?: string;
  },
): RevolvingFundReplenishmentEntry {
  return {
    ...createBlankRevolvingFundReplenishmentEntry(),
    ...entry,
    amount: entry.amount ?? entry.totalAmount ?? "",
    supplierCode: entry.supplierCode ?? entry.accountCode ?? "",
    supplierName: entry.supplierName ?? entry.accountTitle ?? "",
    vatType: entry.vatType ?? "",
    ewtCode: entry.ewtCode ?? "",
    ...calculateRevolvingFundReplenishmentEntryTaxFields(
      entry.amount ?? entry.totalAmount ?? "",
      entry.vatType ?? "",
      entry.ewtCode ?? "",
    ),
  };
}

function getRevolvingFundReplenishmentVatPercent(vatType: string) {
  const match = vatType.match(/(\d+(?:\.\d+)?)/);
  if (match) return Number.parseFloat(match[1]);
  return 0;
}

function getRevolvingFundReplenishmentEwtPercent(ewtCode: string) {
  const rates: Record<string, number> = {
    W05: 5,
    W10: 10,
    WV01: 1,
    WV02: 2,
  };
  return rates[ewtCode] ?? 0;
}

function roundRevolvingFundReplenishmentTaxAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function createSeed(
  id: string,
  transactionNo: string,
  documentDate: string,
  partyCode: string,
  partyName: string,
  amount: number,
  remarks: string,
  status: RevolvingFundReplenishmentStatus,
): RevolvingFundReplenishmentRecord {
  return {
    id,
    transactionNo,
    documentDate,
    partyCode,
    partyName,
    accountCode: "101-200",
    accountTitle: "Revolving Fund",
    amount,
    remarks,
    status,
    createdBy: "Maria Santos",
    createdAt: `${documentDate}T09:00:00`,
    updatedBy: "Maria Santos",
    updatedAt: `${documentDate}T09:00:00`,
  };
}
