import { RevolvingFundStatuses } from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type {
  RevolvingFundFormValues,
  RevolvingFundItem,
  RevolvingFundRecord,
  RevolvingFundStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { calculateTaxAmounts } from "@/app/src/data/shared/tax/TaxData";
import { todayDateValue } from "@/app/src/utils/date.util";

export const RevolvingFundSeedRecords: RevolvingFundRecord[] = [
  createSeed(
    "1",
    "RF-000063",
    "2026-02-23",
    "E000102",
    "Raymark B. Arsicolo",
    120,
    "Initial revolving fund",
    RevolvingFundStatuses.forApproval,
  ),
  createSeed("2", "RF-000062", "2026-02-18", "E000117", "Maria L. Dela Cruz", 15000, "Field operations fund", RevolvingFundStatuses.posted),
  createSeed("3", "RF-000061", "2026-02-12", "E000145", "Jose P. Santos", 8500, "Branch operations fund", RevolvingFundStatuses.draft),
  createSeed(
    "4",
    "RF-000060",
    "2026-02-08",
    "E000117",
    "Maria L. Dela Cruz",
    4200,
    "Disapproved office fund",
    RevolvingFundStatuses.disapproved,
  ),
  createSeed(
    "5",
    "RF-000059",
    "2026-02-02",
    "E000102",
    "Raymark B. Arsicolo",
    3000,
    "Cancelled field fund",
    RevolvingFundStatuses.cancelled,
  ),
];

export const RevolvingFundCopyFromRecords: AppCopyFromRecord[] = [
  {
    amount: "3,250.00",
    documentDate: "2026-02-24",
    id: "pcv-copy-000084",
    partyName: "Raymark B. Arsicolo",
    remarks: "Office pantry and operating supplies",
    source: "Disbursement Voucher",
    sourceNo: "PCV-000084",
  },
  {
    amount: "1,875.50",
    documentDate: "2026-02-20",
    id: "pcv-copy-000083",
    partyName: "Maria L. Dela Cruz",
    remarks: "Local transportation and courier expenses",
    source: "Disbursement Voucher",
    sourceNo: "PCV-000083",
  },
  {
    amount: "4,500.00",
    documentDate: "2026-02-16",
    id: "pcv-copy-000082",
    partyName: "Jose P. Santos",
    remarks: "Branch operating expenses",
    source: "Disbursement Voucher",
    sourceNo: "PCV-000082",
  },
];

export function createBlankRevolvingFundItem(): RevolvingFundItem {
  return {
    id: `rf-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: todayDateValue(),
    payeeCode: "",
    payeeName: "",
    orNo: "",
    tinNo: "",
    remarks: "",
    amount: "",
    netAmount: "",
    vatPercent: "",
    vatAmount: "",
    ewtCode: "",
    ewtPercent: "",
    ewtAmount: "",
    totalAmountDue: "",
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
          payeeCode: "V100006",
          payeeName: "All4U Restaurant",
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
      totalAmountDue: totals.totalAmountDue + parseMoneyNumberInput(item.totalAmountDue),
      grossAmount: totals.grossAmount + parseMoneyNumberInput(item.grossAmount),
    }),
    { amount: 0, netAmount: 0, vatAmount: 0, ewtAmount: 0, totalAmountDue: 0, grossAmount: 0 },
  );
}

export function calculateRevolvingFundItemTaxFields(
  amountValue: string | number,
  vatType = "",
  ewtCode = "",
): Pick<RevolvingFundItem, "netAmount" | "vatPercent" | "vatAmount" | "ewtPercent" | "ewtAmount" | "totalAmountDue" | "grossAmount"> {
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
    totalAmountDue: formatRevolvingFundAmount(taxAmounts.totalAmountDue),
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

function createSeed(
  id: string,
  transactionNo: string,
  documentDate: string,
  partyCode: string,
  partyName: string,
  amount: number,
  remarks: string,
  status: RevolvingFundStatus,
): RevolvingFundRecord {
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
