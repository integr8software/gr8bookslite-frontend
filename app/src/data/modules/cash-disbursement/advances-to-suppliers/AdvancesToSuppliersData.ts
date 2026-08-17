import { AdvancesToSuppliersStatuses } from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  AdvancesToSuppliersFormValues,
  AdvancesToSuppliersRecord,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { todayDateValue } from "@/app/src/utils/date.util";

export const AdvancesToSuppliersSeedRecords: AdvancesToSuppliersRecord[] = [
  createSeed("1", "ATS-000030", "2026-08-17", "S000041", "Pacific Office Solutions, Inc.", "PO-2026-0817", 120000, 30, "Office equipment advance", "For Approval"),
  createSeed("2", "ATS-000029", "2026-08-12", "S000058", "Metro Industrial Trading", "PO-2026-0795", 85000, 25, "Materials reservation", "Posted"),
  createSeed("3", "ATS-000028", "2026-08-08", "S000073", "Northstar Equipment Supply", "PO-2026-0761", 240000, 20, "Equipment procurement", "Draft"),
  createSeed("4", "ATS-000027", "2026-08-03", "S000041", "Pacific Office Solutions, Inc.", "PO-2026-0724", 46000, 50, "Rush order advance", "Disapproved"),
  createSeed("5", "ATS-000026", "2026-07-28", "S000058", "Metro Industrial Trading", "PO-2026-0699", 32000, 10, "Cancelled supplier deposit", "Cancelled"),
];

export function calculateAdvancePayment(totalPoAmount: string, percentage: string) {
  return parseMoneyNumberInput(totalPoAmount) * parseMoneyNumberInput(percentage) / 100;
}

export function createAdvancesToSuppliersFormValues(
  record?: AdvancesToSuppliersRecord,
  transactionNo = "ATS-000001",
  baseCurrencyCode = "PHP",
): AdvancesToSuppliersFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      attachments: record.formValues.attachments.map((attachment) => ({ ...attachment })),
    };
  }
  if (record) {
    return {
      transactionNo: record.transactionNo,
      documentDate: record.documentDate,
      status: record.status,
      partyCode: record.partyCode,
      partyName: record.partyName,
      responsibilityCenter: "Purchasing",
      responsibilityCenterCode: "RC-PUR",
      projectCode: "",
      projectName: "",
      accountCode: record.accountCode,
      accountTitle: record.accountTitle,
      currency: baseCurrencyCode,
      exchangeRate: "1.00",
      poReference: record.poReference,
      totalPoAmount: formatAdvancesToSuppliersAmount(record.totalPoAmount),
      advancePaymentPercentage: formatAdvancesToSuppliersAmount(record.advancePaymentPercentage),
      advancePaymentAmount: formatAdvancesToSuppliersAmount(record.amount),
      remarks: record.remarks,
      attachments: [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: AdvancesToSuppliersStatuses.open,
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
    poReference: "",
    totalPoAmount: "0.00",
    advancePaymentPercentage: "0.00",
    advancePaymentAmount: "0.00",
    remarks: "",
    attachments: [],
  };
}

export function createAdvancesToSuppliersRecord(
  values: AdvancesToSuppliersFormValues,
  status: AdvancesToSuppliersStatus,
  existing?: AdvancesToSuppliersRecord,
): AdvancesToSuppliersRecord {
  const now = new Date().toISOString();
  const amount = calculateAdvancePayment(values.totalPoAmount, values.advancePaymentPercentage);
  return {
    id: existing?.id ?? `ats-${values.transactionNo.toLowerCase()}`,
    transactionNo: values.transactionNo,
    documentDate: values.documentDate,
    partyCode: values.partyCode,
    partyName: values.partyName,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    poReference: values.poReference,
    totalPoAmount: parseMoneyNumberInput(values.totalPoAmount),
    advancePaymentPercentage: parseMoneyNumberInput(values.advancePaymentPercentage),
    amount,
    remarks: values.remarks,
    status,
    createdBy: existing?.createdBy ?? "Current User",
    createdAt: existing?.createdAt ?? now,
    updatedBy: "Current User",
    updatedAt: now,
    formValues: {
      ...values,
      status,
      advancePaymentAmount: formatAdvancesToSuppliersAmount(amount),
      attachments: values.attachments.map((attachment) => ({ ...attachment })),
    },
  };
}

export function formatAdvancesToSuppliersAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}

function createSeed(
  id: string,
  transactionNo: string,
  documentDate: string,
  partyCode: string,
  partyName: string,
  poReference: string,
  totalPoAmount: number,
  advancePaymentPercentage: number,
  remarks: string,
  status: AdvancesToSuppliersStatus,
): AdvancesToSuppliersRecord {
  return {
    id,
    transactionNo,
    documentDate,
    partyCode,
    partyName,
    accountCode: "104-100",
    accountTitle: "Advances to Suppliers",
    poReference,
    totalPoAmount,
    advancePaymentPercentage,
    amount: totalPoAmount * advancePaymentPercentage / 100,
    remarks,
    status,
    createdBy: "Maria Santos",
    createdAt: `${documentDate}T09:00:00`,
    updatedBy: "Maria Santos",
    updatedAt: `${documentDate}T09:00:00`,
  };
}
