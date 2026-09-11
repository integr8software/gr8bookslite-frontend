import { PettyCashVoucherStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherFormValues,
  PettyCashVoucherItem,
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { getEwtPercentFromCode, getVatPercentFromRate, getVatRateFromCode } from "@/app/src/data/shared/tax/TaxData";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import { todayDateValue } from "@/app/src/utils/date.util";

export function createBlankPettyCashVoucherItem(): PettyCashVoucherItem {
  return {
    id: `pcf-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: todayDateValue(),
    supplierCode: "",
    supplierName: "",
    orNo: "",
    tinNo: "",
    particulars: "",
    remarks: "",
    amount: "",
    netAmount: "",
    vatPercent: "",
    vatAmount: "",
    ewtCode: "",
    ewtPercent: "",
    ewtAmount: "",
    disburseAmount: "",
    type: "",
    vatType: "",
    grossAmount: "",
    responsibilityCenterCode: "",
    responsibilityCenterName: "",
  };
}

export function createPettyCashVoucherFormValues(
  record?: PettyCashVoucherRecord,
  transactionNo = "",
  baseCurrencyCode = "PHP",
  taxCodes: AlphanumericTaxCode[] = [],
): PettyCashVoucherFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      items: record.formValues.items.map((item) => normalizePettyCashVoucherItem(item, taxCodes)),
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
      responsibilityCenter: record.responsibilityCenter ?? "",
      responsibilityCenterCode: record.responsibilityCenterCode ?? "",
      currency: record.currency ?? baseCurrencyCode,
      exchangeRate: record.exchangeRate ?? "1.00",
      accountCode: record.accountCode,
      accountTitle: record.accountTitle,
      projectCode: record.projectCode ?? "",
      projectName: record.projectName ?? "",
      remarks: record.remarks,
      items: record.items?.length
        ? record.items.map((item) => normalizePettyCashVoucherItem(item, taxCodes))
        : [
            {
              ...createBlankPettyCashVoucherItem(),
              date: record.documentDate,
              supplierCode: "",
              supplierName: "",
              amount,
              ...calculatePettyCashVoucherItemTaxFields(amount),
              grossAmount: amount,
            },
          ],
      attachments: record.attachments?.map((item) => ({ ...item })) ?? [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: PettyCashVoucherStatuses.Open,
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    responsibilityCenterCode: "",
    currency: baseCurrencyCode,
    exchangeRate: "1.00",
    accountCode: "",
    accountTitle: "",
    projectCode: "",
    projectName: "",
    remarks: "",
    items: [createBlankPettyCashVoucherItem()],
    attachments: [],
  };
}

export function calculatePettyCashVoucherTotals(items: PettyCashVoucherItem[]) {
  return items.reduce(
    (totals, item) => ({
      amount: totals.amount + parseMoneyNumberInput(item.amount),
      netAmount: totals.netAmount + parseMoneyNumberInput(item.netAmount),
      vatAmount: totals.vatAmount + parseMoneyNumberInput(item.vatAmount),
      ewtAmount: totals.ewtAmount + parseMoneyNumberInput(item.ewtAmount),
      disburseAmount: totals.disburseAmount + parseMoneyNumberInput(item.disburseAmount),
      grossAmount: totals.grossAmount + parseMoneyNumberInput(item.grossAmount),
    }),
    { amount: 0, netAmount: 0, vatAmount: 0, ewtAmount: 0, disburseAmount: 0, grossAmount: 0 },
  );
}

export function calculatePettyCashVoucherItemTaxFields(
  amountValue: string | number,
  vatType = "",
  ewtCode = "",
  taxCodes: AlphanumericTaxCode[] = [],
): Pick<PettyCashVoucherItem, "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "disburseAmount" | "grossAmount"> {
  const amount = roundPettyCashTaxAmount(parseMoneyNumberInput(amountValue));
  const vatPercent = getPettyCashVoucherVatPercent(vatType, taxCodes);
  const ewtPercent = getEwtPercentFromCode(ewtCode, taxCodes);
  const taxBaseAmount = vatPercent === 12 ? amount / 1.12 : amount;
  const vatAmount = roundPettyCashTaxAmount(vatPercent === 12 ? taxBaseAmount * 0.12 : (amount * vatPercent) / 100);
  const ewtAmount = roundPettyCashTaxAmount((taxBaseAmount * ewtPercent) / 100);

  return {
    netAmount: formatPettyCashVoucherAmount(Math.max(amount - vatAmount, 0)),
    vatPercent: vatPercent ? `${formatPettyCashVoucherAmount(vatPercent)}%` : "",
    vatAmount: formatPettyCashVoucherAmount(vatAmount),
    ewtPercent: ewtPercent ? `${formatPettyCashVoucherAmount(ewtPercent)}%` : "",
    ewtAmount: formatPettyCashVoucherAmount(ewtAmount),
    disburseAmount: formatPettyCashVoucherAmount(Math.max(amount - ewtAmount, 0)),
    grossAmount: formatPettyCashVoucherAmount(amount),
  };
}

export function createPettyCashVoucherRecord(
  values: PettyCashVoucherFormValues,
  status: PettyCashVoucherStatus,
  existing?: PettyCashVoucherRecord,
): PettyCashVoucherRecord {
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
    responsibilityCenter: values.responsibilityCenter,
    responsibilityCenterCode: values.responsibilityCenterCode,
    projectCode: values.projectCode,
    projectName: values.projectName,
    currency: values.currency,
    exchangeRate: values.exchangeRate,
    amount: calculatePettyCashVoucherTotals(values.items).amount,
    disburseAmount: calculatePettyCashVoucherTotals(values.items).disburseAmount,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Current User",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Current User",
    updatedAt: now,
    items: values.items.map((item) => ({ ...item })),
    attachments: values.attachments.map((item) => ({ ...item })),
    formValues: nextValues,
  };
}

export function formatPettyCashVoucherAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}

function getPettyCashVoucherVatPercent(vatType: string, taxCodes: AlphanumericTaxCode[]) {
  const catalogRate = getVatPercentFromRate(getVatRateFromCode(vatType, taxCodes));
  if (catalogRate) return catalogRate;

  const normalized = vatType.toLowerCase();
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (match) return Number.parseFloat(match[1]);
  return 0;
}

function roundPettyCashTaxAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizePettyCashVoucherItem(item: Partial<PettyCashVoucherItem>, taxCodes: AlphanumericTaxCode[] = []): PettyCashVoucherItem {
  const amount = item.amount ?? item.grossAmount ?? "";

  return {
    ...createBlankPettyCashVoucherItem(),
    ...item,
    amount,
    ...calculatePettyCashVoucherItemTaxFields(amount, item.vatType ?? "", item.ewtCode ?? "", taxCodes),
  };
}
