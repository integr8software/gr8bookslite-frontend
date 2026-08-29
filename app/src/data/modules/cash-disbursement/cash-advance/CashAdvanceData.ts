import {
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { formatMoneyNumberDisplayValue } from "@/app/src/data/shared/money/MoneyNumberData";
import { CashAdvanceStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceFormValues,
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";

export function createCashAdvanceFormValues(baseCurrency = "PHP"): CashAdvanceFormValues {
  return {
    accountId: "",
    accountCode: "",
    accountTitle: "",
    amount: "",
    attachments: [],
    costCenterId: "",
    costCenter: "",
    availableCashAdvance: "",
    cashAdvanceLimit: "",
    currency: baseCurrency,
    documentDate: new Date().toISOString().slice(0, 10),
    fxRate: "1.00",
    partyId: "",
    partyCode: "",
    partyName: "",
    projectId: "",
    referenceFields: {
      accountCode: "",
      costCenterCode: "",
      partyCode: "",
      projectCode: "",
      projectName: "",
      refNo: "",
      projectRef: "",
      importationRefNo: "",
    },
    remarks: "",
    status: CashAdvanceStatuses.draft,
    taxValue: {
      taxDetails: createTaxDetails(0, "0%"),
      taxRate: "0%",
    },
    transNo: "",
  };
}

export function createCashAdvanceFormValuesFromRecord(record: CashAdvanceRecord): CashAdvanceFormValues {
  if (record.formValues) {
    const legacyFormValues = record.formValues as CashAdvanceFormValues & { cashAdvanceBalance?: string };

    return {
      ...createCashAdvanceFormValues(),
      ...record.formValues,
      accountId: record.formValues.accountId,
      accountCode: record.accountCode || record.formValues.accountCode,
      accountTitle: record.accountTitle || record.formValues.accountTitle,
      availableCashAdvance: record.formValues.availableCashAdvance ?? legacyFormValues.cashAdvanceBalance ?? "",
      costCenterId: record.formValues.costCenterId,
      costCenter: record.costCenter || record.formValues.costCenter,
      currency: record.currency ?? record.formValues.currency ?? "PHP",
      fxRate: String(record.fxRate ?? record.formValues.fxRate ?? "1.00"),
      partyId: record.partyId ?? record.formValues.partyId,
      partyCode: record.partyCode || record.formValues.partyCode,
      partyName: record.partyName || record.formValues.partyName,
      projectId: record.formValues.projectId,
      referenceFields: {
        ...record.formValues.referenceFields,
        accountCode: record.accountCode || record.formValues.referenceFields?.accountCode || "",
        costCenterCode: record.costCenterCode || record.formValues.referenceFields?.costCenterCode || "",
        partyCode: record.partyCode || record.formValues.referenceFields?.partyCode || "",
        projectCode: record.projectCode || record.formValues.referenceFields?.projectCode || "",
        projectName:
          record.projectName ||
          record.projectRef ||
          record.formValues.referenceFields?.projectName ||
          record.formValues.referenceFields?.projectRef ||
          "",
        projectRef:
          record.projectName ||
          record.projectRef ||
          record.formValues.referenceFields?.projectName ||
          record.formValues.referenceFields?.projectRef ||
          "",
      },
      status: normalizeCashAdvanceStatus(record.formValues.status),
      transNo: record.formValues.transNo || record.transNo,
    };
  }

  return {
    ...createCashAdvanceFormValues(),
    accountId: "",
    accountCode: record.accountCode,
    accountTitle: record.accountTitle || "",
    amount: formatMoneyNumberDisplayValue(record.amount || ""),
    costCenterId: "",
    costCenter: record.costCenter,
    currency: record.currency ?? "PHP",
    documentDate: record.documentDate,
    fxRate: String(record.fxRate ?? "1.00"),
    partyId: record.partyId ?? "",
    partyCode: record.partyCode,
    partyName: record.partyName,
    projectId: "",
    referenceFields: {
      accountCode: record.accountCode,
      costCenterCode: record.costCenterCode || "",
      partyCode: record.partyCode,
      projectCode: record.projectCode || "",
      projectName: record.projectName || record.projectRef || "",
      refNo: "",
      projectRef: record.projectName || record.projectRef || "",
      importationRefNo: "",
    },
    remarks: record.remarks,
    status: normalizeCashAdvanceStatus(record.status),
    taxValue: {
      taxDetails: syncTaxDetailsAmount(createTaxDetails(0, "0%"), record.amount, "0%"),
      taxRate: "0%",
    },
    transNo: record.transNo,
  };
}

export function countCashAdvancesByStatus(records: CashAdvanceRecord[], status: CashAdvanceStatus) {
  return records.filter((record) => record.status === status).length;
}

export function formatCashAdvanceCurrency(value: number) {
  return formatCurrency(value);
}

export function getCashAdvanceStatusLabel(status: CashAdvanceStatus) {
  return status;
}

function normalizeCashAdvanceStatus(value: string): CashAdvanceStatus {
  if (value === CashAdvanceStatuses.open) {
    return CashAdvanceStatuses.draft;
  }

  if (value === "Approved") {
    return CashAdvanceStatuses.posted;
  }

  if (value === "Pending Review") {
    return CashAdvanceStatuses.forApproval;
  }

  if (value === "Rejected") {
    return CashAdvanceStatuses.disapproved;
  }

  const statuses: CashAdvanceStatus[] = [
    CashAdvanceStatuses.cancelled,
    CashAdvanceStatuses.disapproved,
    CashAdvanceStatuses.draft,
    CashAdvanceStatuses.forApproval,
    CashAdvanceStatuses.posted,
  ];

  return statuses.includes(value as CashAdvanceStatus) ? (value as CashAdvanceStatus) : CashAdvanceStatuses.draft;
}
