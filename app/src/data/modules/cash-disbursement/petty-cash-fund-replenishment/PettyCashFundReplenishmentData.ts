import { PettyCashFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  PettyCashFundReplenishmentEntry,
  PettyCashFundReplenishmentFormValues,
  PettyCashFundReplenishmentRecord,
  PettyCashFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { todayDateValue } from "@/app/src/utils/date.util";

export const PettyCashFundReplenishmentSeedRecords: PettyCashFundReplenishmentRecord[] = [
  createSeed("1", "PCFR-000063", "2026-02-23", "E000102", "Raymark B. Arsicolo", 12500, "February office replenishment", "For Approval"),
  createSeed("2", "PCFR-000062", "2026-02-18", "E000117", "Maria L. Dela Cruz", 15000, "Field operations replenishment", "Posted"),
  createSeed("3", "PCFR-000061", "2026-02-12", "E000145", "Jose P. Santos", 8500, "Branch replenishment", "Draft"),
  createSeed("4", "PCFR-000060", "2026-02-08", "E000117", "Maria L. Dela Cruz", 4200, "Office expense replenishment", "Disapproved"),
  createSeed("5", "PCFR-000059", "2026-02-02", "E000102", "Raymark B. Arsicolo", 3000, "Cancelled replenishment", "Cancelled"),
];

export function createBlankPettyCashFundReplenishmentEntry(): PettyCashFundReplenishmentEntry {
  return {
    id: `pcfr-entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    pettyCashDate: todayDateValue(),
    pettyCashNo: "",
    accountCode: "",
    accountTitle: "",
    totalAmount: "",
    netAmount: "",
    vatAmount: "0.00",
    remarks: "",
  };
}

export function createPettyCashFundReplenishmentFormValues(
  record?: PettyCashFundReplenishmentRecord,
  transactionNo = "PCFR-000001",
  baseCurrencyCode = "PHP",
): PettyCashFundReplenishmentFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      entries: record.formValues.entries.map((entry) => ({ ...entry })),
      attachments: record.formValues.attachments.map((attachment) => ({ ...attachment })),
    };
  }
  if (record) {
    const amount = formatPettyCashFundReplenishmentAmount(record.amount);
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
      entries: [{
        ...createBlankPettyCashFundReplenishmentEntry(),
        pettyCashDate: record.documentDate,
        pettyCashNo: "PCV-000084",
        accountCode: "610-100",
        accountTitle: "Office Supplies Expense",
        totalAmount: amount,
        netAmount: amount,
        remarks: record.remarks,
      }],
      attachments: [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: PettyCashFundReplenishmentStatuses.open,
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
    entries: [createBlankPettyCashFundReplenishmentEntry()],
    attachments: [],
  };
}

export function calculatePettyCashFundReplenishmentTotals(
  entries: PettyCashFundReplenishmentEntry[],
) {
  return entries.reduce(
    (totals, entry) => ({
      totalAmount: totals.totalAmount + parseMoneyNumberInput(entry.totalAmount),
      netAmount: totals.netAmount + parseMoneyNumberInput(entry.netAmount),
      vatAmount: totals.vatAmount + parseMoneyNumberInput(entry.vatAmount),
    }),
    { totalAmount: 0, netAmount: 0, vatAmount: 0 },
  );
}

export function createPettyCashFundReplenishmentRecord(
  values: PettyCashFundReplenishmentFormValues,
  status: PettyCashFundReplenishmentStatus,
  existing?: PettyCashFundReplenishmentRecord,
): PettyCashFundReplenishmentRecord {
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
    amount: calculatePettyCashFundReplenishmentTotals(values.entries).totalAmount,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Current User",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Current User",
    updatedAt: now,
    formValues: nextValues,
  };
}

export function formatPettyCashFundReplenishmentAmount(value: number) {
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
  status: PettyCashFundReplenishmentStatus,
): PettyCashFundReplenishmentRecord {
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
