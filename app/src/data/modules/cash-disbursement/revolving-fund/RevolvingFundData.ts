import { RevolvingFundStatuses } from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type {
  RevolvingFundFormValues,
  RevolvingFundItem,
  RevolvingFundRecord,
  RevolvingFundStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { calculateTaxAmounts } from "@/app/src/data/shared/tax/TaxData";
import { todayDateValue } from "@/app/src/utils/date.util";

export function createBlankRevolvingFundItem(): RevolvingFundItem {
  return {
    id: `rf-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

export function createRevolvingFundFormValues(
  record?: RevolvingFundRecord,
  transactionNo = "RF-000001",
  baseCurrencyCode = "PHP",
): RevolvingFundFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      items: record.formValues.items.map(normalizeRevolvingFundItem),
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
      responsibilityCenter: "",
      responsibilityCenterCode: "",
      currency: "PHP",
      exchangeRate: "1.00",
      accountCode: record.accountCode,
      accountTitle: record.accountTitle,
      projectCode: "",
      projectName: "",
      remarks: record.remarks,
      items: [
        {
          ...createBlankRevolvingFundItem(),
          date: record.documentDate,
          supplierCode: "V100006",
          supplierName: "All4U Restaurant",
          amount,
          ...calculateRevolvingFundItemTaxFields(amount),
          grossAmount: amount,
        },
      ],
      attachments: [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: RevolvingFundStatuses.open,
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
    items: [createBlankRevolvingFundItem()],
    attachments: [],
  };
}

export function calculateRevolvingFundTotals(items: RevolvingFundItem[]) {
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

export function calculateRevolvingFundItemTaxFields(
  amountValue: string | number,
  vatType = "",
  ewtCode = "",
): Pick<RevolvingFundItem, "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "disburseAmount" | "grossAmount"> {
  const amount = roundRevolvingFundTaxAmount(parseMoneyNumberInput(amountValue));
  const vatPercent = getRevolvingFundVatPercent(vatType);
  const ewtPercent = getRevolvingFundEwtPercent(ewtCode);
  const taxAmounts = calculateTaxAmounts({
    grossAmount: amount,
    taxRate: vatPercent,
    ewtRate: ewtPercent,
  });

  return {
    netAmount: formatRevolvingFundAmount(taxAmounts.netAmount),
    vatPercent: vatPercent ? `${formatRevolvingFundAmount(vatPercent)}%` : "",
    vatAmount: formatRevolvingFundAmount(taxAmounts.vatAmount),
    ewtPercent: ewtPercent ? `${formatRevolvingFundAmount(ewtPercent)}%` : "",
    ewtAmount: formatRevolvingFundAmount(taxAmounts.ewtAmount),
    disburseAmount: formatRevolvingFundAmount(taxAmounts.totalAmountDue),
    grossAmount: formatRevolvingFundAmount(amount),
  };
}

export function createRevolvingFundRecord(
  values: RevolvingFundFormValues,
  status: RevolvingFundStatus,
  existing?: RevolvingFundRecord,
): RevolvingFundRecord {
  const now = new Date().toISOString();
  const nextValues = {
    ...values,
    status,
    items: values.items.map((item) => ({ ...item })),
    attachments: values.attachments.map((item) => ({ ...item })),
  };
  return {
    id: existing?.id ?? `rf-${values.transactionNo.toLowerCase()}`,
    transactionNo: values.transactionNo,
    documentDate: values.documentDate,
    partyCode: values.partyCode,
    partyName: values.partyName,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    currency: values.currency,
    exchangeRate: values.exchangeRate,
    amount: calculateRevolvingFundTotals(values.items).amount,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Current User",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Current User",
    updatedAt: now,
    formValues: nextValues,
  };
}

export function formatRevolvingFundAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}

function getRevolvingFundVatPercent(vatType: string) {
  const match = vatType.toLowerCase().match(/(\d+(?:\.\d+)?)/);
  if (match) return Number.parseFloat(match[1]);
  return 0;
}

function getRevolvingFundEwtPercent(ewtCode: string) {
  const rates: Record<string, number> = {
    W05: 5,
    W10: 10,
    WV01: 1,
    WV02: 2,
  };
  return rates[ewtCode] ?? 0;
}

function roundRevolvingFundTaxAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeRevolvingFundItem(item: Partial<RevolvingFundItem>): RevolvingFundItem {
  const amount = item.amount ?? item.grossAmount ?? "";

  return {
    ...createBlankRevolvingFundItem(),
    ...item,
    amount,
    ...calculateRevolvingFundItemTaxFields(amount, item.vatType ?? "", item.ewtCode ?? ""),
  };
}
