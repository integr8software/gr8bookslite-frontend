import { AdvancesToSuppliersStatuses } from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import { formatMoneyNumberDisplayValue, parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  AdvancesToSuppliersFormValues,
  AdvancesToSuppliersRecord,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { todayDateValue } from "@/app/src/utils/date.util";

export function calculateAdvancePayment(totalPoAmount: string, percentage: string) {
  return (parseMoneyNumberInput(totalPoAmount) * parseMoneyNumberInput(percentage)) / 100;
}

export function calculateAdvancePaymentPercentage(totalPoAmount: string, advanceAmount: string) {
  const total = parseMoneyNumberInput(totalPoAmount);
  const amount = parseMoneyNumberInput(advanceAmount);
  if (total <= 0) return 0;
  return (amount / total) * 100;
}

export function createAdvancesToSuppliersFormValues(
  record?: AdvancesToSuppliersRecord,
  transactionNo = "",
  baseCurrencyCode = "PHP",
): AdvancesToSuppliersFormValues {
  if (record?.formValues) {
    return {
      ...record.formValues,
      advancePaymentType: record.formValues.advancePaymentType || record.advancePaymentType || "Percentage",
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
      partyId: record.partyId,
      responsibilityCenter: record.responsibilityCenter ?? "",
      responsibilityCenterCode: record.responsibilityCenterCode ?? "",
      projectCode: record.projectCode ?? "",
      projectName: record.projectName ?? "",
      accountCode: record.accountCode,
      accountTitle: record.accountTitle,
      currency: record.currency ?? baseCurrencyCode,
      exchangeRate: record.exchangeRate ?? "1.00",
      poReference: record.poReference,
      totalPoAmount: formatAdvancesToSuppliersAmount(record.totalPoAmount),
      advancePaymentType: record.advancePaymentType || "Percentage",
      advancePaymentPercentage: formatAdvancesToSuppliersAmount(record.advancePaymentPercentage),
      advancePaymentAmount: formatAdvancesToSuppliersAmount(record.amount),
      remarks: record.remarks,
      attachments: [],
    };
  }
  return {
    transactionNo,
    documentDate: todayDateValue(),
    status: AdvancesToSuppliersStatuses.Open,
    partyId: "",
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
    totalPoAmount: "",
    advancePaymentType: "Percentage",
    advancePaymentPercentage: "",
    advancePaymentAmount: "",
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
  const isPercentage = values.advancePaymentType === "Percentage";
  const amount = isPercentage
    ? calculateAdvancePayment(values.totalPoAmount, values.advancePaymentPercentage)
    : parseMoneyNumberInput(values.advancePaymentAmount);
  const percentage = isPercentage
    ? parseMoneyNumberInput(values.advancePaymentPercentage)
    : calculateAdvancePaymentPercentage(values.totalPoAmount, values.advancePaymentAmount);

  return {
    id: existing?.id ?? `ats-${values.transactionNo.toLowerCase()}`,
    transactionNo: values.transactionNo,
    documentDate: values.documentDate,
    partyCode: values.partyCode,
    partyName: values.partyName,
    partyId: values.partyId,
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    responsibilityCenter: values.responsibilityCenter,
    responsibilityCenterCode: values.responsibilityCenterCode,
    projectCode: values.projectCode,
    projectName: values.projectName,
    currency: values.currency,
    exchangeRate: values.exchangeRate,
    poReference: values.poReference,
    totalPoAmount: parseMoneyNumberInput(values.totalPoAmount),
    advancePaymentType: values.advancePaymentType,
    advancePaymentPercentage: percentage,
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
      advancePaymentPercentage: formatAdvancesToSuppliersAmount(percentage),
      advancePaymentAmount: formatAdvancesToSuppliersAmount(amount),
      attachments: values.attachments.map((attachment) => ({ ...attachment })),
    },
  };
}

export function formatAdvancesToSuppliersAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}
