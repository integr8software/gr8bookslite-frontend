import { PettyCashFundStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundFormValues,
  PettyCashFundItem,
  PettyCashFundRecord,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { todayDateValue } from "@/app/src/utils/date.util";

export const PettyCashFundSeedRecords: PettyCashFundRecord[] = [
  createSeed(
    "1",
    "PCF-000063",
    "2026-02-23",
    "E000102",
    "Raymark B. Arsicolo",
    120,
    "Initial petty cash fund",
    PettyCashFundStatuses.forApproval,
  ),
  createSeed(
    "2",
    "PCF-000062",
    "2026-02-18",
    "E000117",
    "Maria L. Dela Cruz",
    15000,
    "Field operations fund",
    PettyCashFundStatuses.posted,
  ),
  createSeed("3", "PCF-000061", "2026-02-12", "E000145", "Jose P. Santos", 8500, "Branch petty cash", PettyCashFundStatuses.draft),
  createSeed(
    "4",
    "PCF-000060",
    "2026-02-08",
    "E000117",
    "Maria L. Dela Cruz",
    4200,
    "Disapproved office fund",
    PettyCashFundStatuses.disapproved,
  ),
  createSeed(
    "5",
    "PCF-000059",
    "2026-02-02",
    "E000102",
    "Raymark B. Arsicolo",
    3000,
    "Cancelled field fund",
    PettyCashFundStatuses.cancelled,
  ),
];

export const PettyCashFundCopyFromRecords: AppCopyFromRecord[] = [
  {
    amount: "3,250.00",
    documentDate: "2026-02-24",
    id: "pcv-copy-000084",
    partyName: "Raymark B. Arsicolo",
    remarks: "Office pantry and operating supplies",
    source: "Petty Cash Voucher",
    sourceNo: "PCV-000084",
  },
  {
    amount: "1,875.50",
    documentDate: "2026-02-20",
    id: "pcv-copy-000083",
    partyName: "Maria L. Dela Cruz",
    remarks: "Local transportation and courier expenses",
    source: "Petty Cash Voucher",
    sourceNo: "PCV-000083",
  },
  {
    amount: "4,500.00",
    documentDate: "2026-02-16",
    id: "pcv-copy-000082",
    partyName: "Jose P. Santos",
    remarks: "Branch operating expenses",
    source: "Petty Cash Voucher",
    sourceNo: "PCV-000082",
  },
];

export function createBlankPettyCashFundItem(): PettyCashFundItem {
  return {
    id: `pcf-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: todayDateValue(),
    payeeCode: "",
    payeeName: "",
    orNo: "",
    tinNo: "",
    remarks: "",
    amount: "",
    netAmount: "",
    vatAmount: "",
    type: "",
    vatType: "",
    vatable: "False",
    vatInclusive: "False",
    grossAmount: "",
    responsibilityCenter: "",
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
          payeeCode: "V100006",
          payeeName: "All4U Restaurant",
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

export function formatPettyCashFundAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
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
