import { PettyCashFundStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundFormValues,
  PettyCashFundItem,
  PettyCashFundRecord,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { calculateTaxAmounts } from "@/app/src/data/shared/tax/TaxData";
import { todayDateValue } from "@/app/src/utils/date.util";

export function createBlankPettyCashFundItem(): PettyCashFundItem {
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

export function createPettyCashFundFormValues(
  record?: PettyCashFundRecord,
  transactionNo = "PCF-000001",
  baseCurrencyCode = "PHP",
): PettyCashFundFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      items: record.formValues.items.map(normalizePettyCashFundItem),
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
          ...createBlankPettyCashFundItem(),
          date: record.documentDate,
          supplierCode: "V100006",
          supplierName: "All4U Restaurant",
          amount,
          ...calculatePettyCashFundItemTaxFields(amount),
          grossAmount: amount,
        },
      ],
      attachments: [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: PettyCashFundStatuses.open,
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
      ewtAmount: totals.ewtAmount + parseMoneyNumberInput(item.ewtAmount),
      disburseAmount: totals.disburseAmount + parseMoneyNumberInput(item.disburseAmount),
      grossAmount: totals.grossAmount + parseMoneyNumberInput(item.grossAmount),
    }),
    { amount: 0, netAmount: 0, vatAmount: 0, ewtAmount: 0, disburseAmount: 0, grossAmount: 0 },
  );
}

export function calculatePettyCashFundItemTaxFields(
  amountValue: string | number,
  vatType = "",
  ewtCode = "",
): Pick<PettyCashFundItem, "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "disburseAmount" | "grossAmount"> {
  const amount = roundPettyCashTaxAmount(parseMoneyNumberInput(amountValue));
  const vatPercent = getPettyCashFundVatPercent(vatType);
  const ewtPercent = getPettyCashFundEwtPercent(ewtCode);
  const taxAmounts = calculateTaxAmounts({
    grossAmount: amount,
    taxRate: vatPercent,
    ewtRate: ewtPercent,
  });

  return {
    netAmount: formatPettyCashFundAmount(taxAmounts.netAmount),
    vatPercent: vatPercent ? `${formatPettyCashFundAmount(vatPercent)}%` : "",
    vatAmount: formatPettyCashFundAmount(taxAmounts.vatAmount),
    ewtPercent: ewtPercent ? `${formatPettyCashFundAmount(ewtPercent)}%` : "",
    ewtAmount: formatPettyCashFundAmount(taxAmounts.ewtAmount),
    disburseAmount: formatPettyCashFundAmount(taxAmounts.totalAmountDue),
    grossAmount: formatPettyCashFundAmount(amount),
  };
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
    currency: values.currency,
    exchangeRate: values.exchangeRate,
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

export function formatPettyCashFundAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}

function getPettyCashFundVatPercent(vatType: string) {
  const normalized = vatType.toLowerCase();
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (match) return Number.parseFloat(match[1]);
  return 0;
}

function getPettyCashFundEwtPercent(ewtCode: string) {
  const rates: Record<string, number> = {
    W05: 5,
    W10: 10,
    WV01: 1,
    WV02: 2,
  };
  return rates[ewtCode] ?? 0;
}

function roundPettyCashTaxAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizePettyCashFundItem(item: Partial<PettyCashFundItem>): PettyCashFundItem {
  const amount = item.amount ?? item.grossAmount ?? "";

  return {
    ...createBlankPettyCashFundItem(),
    ...item,
    amount,
    ...calculatePettyCashFundItemTaxFields(amount, item.vatType ?? "", item.ewtCode ?? ""),
  };
}
