import { PettyCashReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { calculatePettyCashFundTotals } from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { PettyCashFundRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type {
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentFormValues,
  PettyCashReplenishmentRecord,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { todayDateValue } from "@/app/src/utils/date.util";

export const PettyCashReplenishmentSeedRecords: PettyCashReplenishmentRecord[] = [
  createSeed(
    "1",
    "PCR-000063",
    "2026-02-23",
    "E000102",
    "Raymark B. Arsicolo",
    12500,
    "February office replenishment",
    PettyCashReplenishmentStatuses.forApproval,
  ),
  createSeed(
    "2",
    "PCR-000062",
    "2026-02-18",
    "E000117",
    "Maria L. Dela Cruz",
    15000,
    "Field operations replenishment",
    PettyCashReplenishmentStatuses.posted,
  ),
  createSeed(
    "3",
    "PCR-000061",
    "2026-02-12",
    "E000145",
    "Jose P. Santos",
    8500,
    "Branch replenishment",
    PettyCashReplenishmentStatuses.draft,
  ),
  createSeed(
    "4",
    "PCR-000060",
    "2026-02-08",
    "E000117",
    "Maria L. Dela Cruz",
    4200,
    "Office expense replenishment",
    PettyCashReplenishmentStatuses.disapproved,
  ),
  createSeed(
    "5",
    "PCR-000059",
    "2026-02-02",
    "E000102",
    "Raymark B. Arsicolo",
    3000,
    "Cancelled replenishment",
    PettyCashReplenishmentStatuses.cancelled,
  ),
];

export function createBlankPettyCashReplenishmentEntry(): PettyCashReplenishmentEntry {
  return {
    id: `pcfr-entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    pettyCashDate: todayDateValue(),
    pettyCashNo: "",
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
    disburseAmount: "",
    responsibilityCenterCode: "",
    responsibilityCenterName: "",
    particulars: "",
    remarks: "",
  };
}

export function createPettyCashReplenishmentFormValues(
  record?: PettyCashReplenishmentRecord,
  transactionNo = "PCR-000001",
  baseCurrencyCode = "PHP",
): PettyCashReplenishmentFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      entries: record.formValues.entries.map(normalizePettyCashReplenishmentEntry),
      attachments: record.formValues.attachments.map((attachment) => ({ ...attachment })),
    };
  }
  if (record) {
    const amount = formatPettyCashReplenishmentAmount(record.amount);
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
          ...createBlankPettyCashReplenishmentEntry(),
          pettyCashDate: record.documentDate,
          pettyCashNo: "PCV-000084",
          supplierCode: record.partyCode,
          supplierName: record.partyName,
          amount,
          ...calculatePettyCashReplenishmentEntryTaxFields(amount),
          particulars: record.remarks,
          remarks: record.remarks,
        },
      ],
      attachments: [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: PettyCashReplenishmentStatuses.open,
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
    entries: [createBlankPettyCashReplenishmentEntry()],
    attachments: [],
  };
}

export function calculatePettyCashReplenishmentTotals(entries: PettyCashReplenishmentEntry[]) {
  return entries.reduce(
    (totals, entry) => ({
      totalAmount: totals.totalAmount + parseMoneyNumberInput(entry.amount),
      netAmount: totals.netAmount + parseMoneyNumberInput(entry.netAmount),
      vatAmount: totals.vatAmount + parseMoneyNumberInput(entry.vatAmount),
      ewtAmount: totals.ewtAmount + parseMoneyNumberInput(entry.ewtAmount),
      disburseAmount: totals.disburseAmount + parseMoneyNumberInput(entry.disburseAmount),
    }),
    { totalAmount: 0, netAmount: 0, vatAmount: 0, ewtAmount: 0, disburseAmount: 0 },
  );
}

export function createPettyCashReplenishmentCopyFromRecords(records: PettyCashFundRecord[]): AppCopyFromRecord[] {
  return records.map((record) => ({
    amount: formatPettyCashReplenishmentAmount(getPettyCashReplenishmentSourceTotals(record).totalAmount),
    documentDate: record.documentDate,
    id: record.id,
    partyName: record.partyName,
    remarks: record.remarks,
    source: "Petty Cash Fund",
    sourceNo: record.transactionNo,
  }));
}

export function applyPettyCashFundToReplenishmentForm(
  values: PettyCashReplenishmentFormValues,
  source: PettyCashFundRecord,
): PettyCashReplenishmentFormValues {
  const totals = getPettyCashReplenishmentSourceTotals(source);
  const sourceValues = source.formValues;

  const entries = sourceValues?.items.length
    ? sourceValues.items.map((item) => ({
        ...createBlankPettyCashReplenishmentEntry(),
        amount: item.grossAmount || item.amount,
        ...calculatePettyCashReplenishmentEntryTaxFields(
          item.grossAmount || item.amount,
          item.vatType,
          item.ewtCode,
        ),
        ewtCode: item.ewtCode,
        pettyCashDate: item.date || source.documentDate,
        pettyCashNo: source.transactionNo,
        remarks: item.remarks || source.remarks,
        supplierCode: item.supplierCode,
        supplierName: item.supplierName,
        vatType: item.vatType,
      }))
    : [
        {
          ...createBlankPettyCashReplenishmentEntry(),
          amount: formatPettyCashReplenishmentAmount(totals.totalAmount),
          ...calculatePettyCashReplenishmentEntryTaxFields(totals.totalAmount),
          pettyCashDate: source.documentDate,
          pettyCashNo: source.transactionNo,
          remarks: source.remarks,
          supplierCode: source.partyCode,
          supplierName: source.partyName,
        },
      ];

  return {
    ...values,
    accountCode: source.accountCode,
    accountTitle: source.accountTitle,
    currency: sourceValues?.currency ?? values.currency,
    exchangeRate: sourceValues?.exchangeRate ?? values.exchangeRate,
    partyCode: source.partyCode,
    partyName: source.partyName,
    projectCode: sourceValues?.projectCode ?? "",
    projectName: sourceValues?.projectName ?? "",
    remarks: source.remarks,
    responsibilityCenter: sourceValues?.responsibilityCenter ?? "",
    responsibilityCenterCode: sourceValues?.responsibilityCenterCode ?? "",
    entries,
  };
}

export function createPettyCashReplenishmentRecord(
  values: PettyCashReplenishmentFormValues,
  status: PettyCashReplenishmentStatus,
  existing?: PettyCashReplenishmentRecord,
): PettyCashReplenishmentRecord {
  const now = new Date().toISOString();
  const nextValues = {
    ...values,
    status,
    entries: values.entries.map((entry) => ({ ...entry })),
    attachments: values.attachments.map((attachment) => ({ ...attachment })),
  };
  return {
    id: existing?.id ?? `pcfr-${values.transactionNo.toLowerCase()}`,
    transactionNo: values.transactionNo,
    documentDate: values.documentDate,
    partyCode: values.partyCode,
    partyName: values.partyName,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    amount: calculatePettyCashReplenishmentTotals(values.entries).totalAmount,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Current User",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Current User",
    updatedAt: now,
    formValues: nextValues,
  };
}

export function formatPettyCashReplenishmentAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}

export function calculatePettyCashReplenishmentEntryTaxFields(
  amountValue: string | number,
  vatType = "",
  ewtCode = "",
): Pick<
  PettyCashReplenishmentEntry,
  "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "disburseAmount"
> {
  const amount = roundPettyCashReplenishmentTaxAmount(parseMoneyNumberInput(amountValue));
  const vatPercent = getPettyCashReplenishmentVatPercent(vatType);
  const ewtPercent = getPettyCashReplenishmentEwtPercent(ewtCode);
  const vatAmount = roundPettyCashReplenishmentTaxAmount((amount * vatPercent) / 100);
  const ewtAmount = roundPettyCashReplenishmentTaxAmount((amount * ewtPercent) / 100);

  return {
    netAmount: formatPettyCashReplenishmentAmount(Math.max(amount - vatAmount, 0)),
    vatPercent: vatPercent ? `${formatPettyCashReplenishmentAmount(vatPercent)}%` : "",
    vatAmount: formatPettyCashReplenishmentAmount(vatAmount),
    ewtPercent: ewtPercent ? `${formatPettyCashReplenishmentAmount(ewtPercent)}%` : "",
    ewtAmount: formatPettyCashReplenishmentAmount(ewtAmount),
    disburseAmount: formatPettyCashReplenishmentAmount(Math.max(amount - ewtAmount, 0)),
  };
}

function getPettyCashReplenishmentSourceTotals(record: PettyCashFundRecord) {
  if (!record.formValues) {
    return {
      netAmount: record.amount,
      totalAmount: record.amount,
      vatAmount: 0,
    };
  }

  const totals = calculatePettyCashFundTotals(record.formValues.items);

  return {
    netAmount: totals.netAmount,
    totalAmount: totals.grossAmount,
    vatAmount: totals.vatAmount,
  };
}

function normalizePettyCashReplenishmentEntry(
  entry: Partial<PettyCashReplenishmentEntry> & {
    accountCode?: string;
    accountTitle?: string;
    totalAmount?: string;
  },
): PettyCashReplenishmentEntry {
  return {
    ...createBlankPettyCashReplenishmentEntry(),
    ...entry,
    amount: entry.amount ?? entry.totalAmount ?? "",
    supplierCode: entry.supplierCode ?? entry.accountCode ?? "",
    supplierName: entry.supplierName ?? entry.accountTitle ?? "",
    vatType: entry.vatType ?? "",
    ewtCode: entry.ewtCode ?? "",
    ...calculatePettyCashReplenishmentEntryTaxFields(
      entry.amount ?? entry.totalAmount ?? "",
      entry.vatType ?? "",
      entry.ewtCode ?? "",
    ),
  };
}

function getPettyCashReplenishmentVatPercent(vatType: string) {
  const match = vatType.match(/(\d+(?:\.\d+)?)/);
  if (match) return Number.parseFloat(match[1]);
  return 0;
}

function getPettyCashReplenishmentEwtPercent(ewtCode: string) {
  const rates: Record<string, number> = {
    W05: 5,
    W10: 10,
    WV01: 1,
    WV02: 2,
  };
  return rates[ewtCode] ?? 0;
}

function roundPettyCashReplenishmentTaxAmount(value: number) {
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
  status: PettyCashReplenishmentStatus,
): PettyCashReplenishmentRecord {
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
