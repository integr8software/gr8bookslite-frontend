import { RevolvingFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  RevolvingFundReplenishmentEntry,
  RevolvingFundReplenishmentFormValues,
  RevolvingFundReplenishmentRecord,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { roundCurrency } from "@/app/src/utils/currency.util";
import { todayDateValue } from "@/app/src/utils/date.util";
import { parseTaxPercent } from "@/app/src/utils/percentage.util";

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
    disburseAmount: "",
    responsibilityCenterCode: "",
    responsibilityCenterName: "",
    particulars: "",
    remarks: "",
  };
}

export function createRevolvingFundReplenishmentFormValues(
  record?: RevolvingFundReplenishmentRecord,
  transactionNo = "",
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
      responsibilityCenter: record.responsibilityCenter ?? "",
      responsibilityCenterCode: record.responsibilityCenterCode ?? "",
      projectCode: record.projectCode ?? "",
      projectName: record.projectName ?? "",
      accountCode: record.accountCode,
      accountTitle: record.accountTitle,
      currency: record.currency ?? baseCurrencyCode,
      exchangeRate: record.exchangeRate ?? "1.00",
      remarks: record.remarks,
      entries: record.entries?.length
        ? record.entries.map(normalizeRevolvingFundReplenishmentEntry)
        : [
            {
              ...createBlankRevolvingFundReplenishmentEntry(),
              revolvingFundDate: record.documentDate,
              revolvingFundNo: "RFV-000084",
              supplierCode: record.partyCode,
              supplierName: record.partyName,
              amount,
              ...calculateRevolvingFundReplenishmentEntryTaxFields(amount),
              particulars: record.remarks,
              remarks: record.remarks,
            },
          ],
      attachments: record.attachments?.map((attachment) => ({ ...attachment })) ?? [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: RevolvingFundReplenishmentStatuses.Open,
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
      disburseAmount: totals.disburseAmount + parseMoneyNumberInput(entry.disburseAmount),
    }),
    { totalAmount: 0, netAmount: 0, vatAmount: 0, ewtAmount: 0, disburseAmount: 0 },
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
    responsibilityCenter: values.responsibilityCenter,
    responsibilityCenterCode: values.responsibilityCenterCode,
    projectCode: values.projectCode,
    projectName: values.projectName,
    currency: values.currency,
    exchangeRate: values.exchangeRate,
    amount: calculateRevolvingFundReplenishmentTotals(values.entries).totalAmount,
    disburseAmount: calculateRevolvingFundReplenishmentTotals(values.entries).disburseAmount,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Current User",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Current User",
    updatedAt: now,
    entries: values.entries.map((entry) => ({ ...entry })),
    attachments: values.attachments.map((attachment) => ({ ...attachment })),
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
): Pick<RevolvingFundReplenishmentEntry, "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "disburseAmount"> {
  const amount = roundCurrency(parseMoneyNumberInput(amountValue));
  const vatPercent = getRevolvingFundReplenishmentVatPercent(vatType);
  const ewtPercent = parseTaxPercent(ewtCode);
  const vatAmount = roundCurrency((amount * vatPercent) / 100);
  const ewtAmount = roundCurrency((amount * ewtPercent) / 100);

  return {
    netAmount: formatRevolvingFundReplenishmentAmount(Math.max(amount - vatAmount, 0)),
    vatPercent: vatPercent ? `${formatRevolvingFundReplenishmentAmount(vatPercent)}%` : "",
    vatAmount: formatRevolvingFundReplenishmentAmount(vatAmount),
    ewtPercent: ewtPercent ? `${formatRevolvingFundReplenishmentAmount(ewtPercent)}%` : "",
    ewtAmount: formatRevolvingFundReplenishmentAmount(ewtAmount),
    disburseAmount: formatRevolvingFundReplenishmentAmount(Math.max(amount - ewtAmount, 0)),
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
    ...calculateRevolvingFundReplenishmentEntryTaxFields(entry.amount ?? entry.totalAmount ?? "", entry.vatType ?? "", entry.ewtCode ?? ""),
  };
}

function getRevolvingFundReplenishmentVatPercent(vatType: string) {
  const match = vatType.match(/(\d+(?:\.\d+)?)/);
  if (match) return Number.parseFloat(match[1]);
  return 0;
}
