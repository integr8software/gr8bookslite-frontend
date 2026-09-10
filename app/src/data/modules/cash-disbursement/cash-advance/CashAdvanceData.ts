import { CashAdvanceStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { ResponsibilityCenterInitialFormValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import type {
  CashAdvanceAccountingEntry,
  CashAdvanceFormValues,
  CashAdvanceItem,
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type {
  ResponsibilityCenter,
  ResponsibilityCenterClassification,
  ResponsibilityCenterFormValues,
  ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { formatAmount } from "@/app/src/utils/currency.util";
import { parseFiniteNumber } from "@/app/src/utils/number.util";

export function createBlankCashAdvanceItem(values: Partial<CashAdvanceItem> = {}): CashAdvanceItem {
  const particulars = values.particulars ?? values.remarks ?? "";
  return {
    amount: "",
    cashAdvanceBalance: "",
    cashAdvanceLimit: "",
    id: `ca-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    particulars,
    remarks: particulars,
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    ...values,
  };
}

export function createBlankCashAdvanceAccountingEntry(
  values: Partial<CashAdvanceAccountingEntry> = {},
): CashAdvanceAccountingEntry {
  const particulars = values.particulars ?? values.remarks ?? "";
  return {
    accountCode: "",
    accountTitle: "",
    credit: "",
    debit: "",
    id: `ca-accounting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    particulars,
    remarks: particulars,
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    ...values,
  };
}

export function createCashAdvanceFormValues(baseCurrencyCode = "PHP"): CashAdvanceFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    accountCode: "",
    accountTitle: "",
    accountingEntries: [createBlankCashAdvanceAccountingEntry()],
    attachments: [],
    contractNo: "",
    costCenter: "",
    currency: baseCurrencyCode,
    documentDate: today,
    exchangeRate: "1.00",
    items: [createBlankCashAdvanceItem()],
    partyCode: "",
    partyName: "",
    projectCode: "",
    projectName: "",
    projectRef: "",
    remarks: "",
    status: CashAdvanceStatuses.Open,
    totalAmount: "",
    transNo: "",
  };
}

export function createCashAdvanceFormValuesFromRecord(
  record: CashAdvanceRecord,
): CashAdvanceFormValues {
  if (record.formValues) {
    return {
      ...createCashAdvanceFormValues(),
      ...record.formValues,
      items: (record.formValues.items ?? []).map((item) => ({
        ...item,
        cashAdvanceBalance: item.cashAdvanceBalance ?? "",
      })),
      accountingEntries: record.formValues.accountingEntries ?? [],
      projectCode: record.formValues.projectCode ?? record.projectCode ?? "",
      projectName: record.formValues.projectName ?? record.formValues.projectRef ?? record.projectName ?? record.projectRef ?? "",
      projectRef: record.formValues.projectName ?? record.formValues.projectRef ?? record.projectName ?? record.projectRef ?? "",
      currency: record.currency ?? record.formValues.currency ?? "PHP",
      exchangeRate: String(record.exchangeRate ?? record.formValues.exchangeRate ?? "1.00"),
      status: normalizeCashAdvanceStatus(record.formValues.status),
      transNo: record.formValues.transNo || record.transNo,
    };
  }

  return {
    ...createCashAdvanceFormValues(),
    accountCode: record.accountCode,
    accountTitle: record.accountTitle,
    costCenter: record.costCenter,
    currency: record.currency ?? "PHP",
    documentDate: record.documentDate,
    exchangeRate: String(record.exchangeRate ?? "1.00"),
    partyCode: record.partyCode,
    partyName: record.partyName,
    projectCode: record.projectCode ?? "",
    projectName: record.projectName ?? record.projectRef ?? "",
    projectRef: record.projectName ?? record.projectRef ?? "",
    remarks: record.remarks,
    status: normalizeCashAdvanceStatus(record.status),
    totalAmount: String(record.amount || ""),
    transNo: record.transNo,
  };
}

export function calculateCashAdvanceTotal(rows: CashAdvanceItem[]) {
  return rows.reduce((total, row) => total + parseFiniteNumber(row.amount), 0);
}

export function formatCashAdvanceAmount(value: number | string) {
  return formatAmount(parseFiniteNumber(value));
}

export function countCashAdvancesByStatus(records: CashAdvanceRecord[], status: CashAdvanceStatus) {
  return records.filter((record) => record.status === status).length;
}

export function createCashAdvanceSelectOptions(
  options: readonly { label: string; value: string }[],
): AppAdvancedDropdownOption[] {
  return options
    .filter((option) => option.value)
    .map((option) => ({
      label: option.value,
      name: option.label,
      value: option.value,
    }));
}

export function createCashAdvanceProjectOptions({
  centers,
  currentProjectCode,
  currentProjectName,
}: {
  centers: ResponsibilityCenter[];
  currentProjectCode: string;
  currentProjectName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [];

  centers
    .filter((center) => center.status === "Active" && center.category === "Project")
    .forEach((center) => {
      addUniqueDropdownOption(options, {
        description: center.financialType,
        label: center.code,
        name: center.name,
        value: center.name,
      });
    });

  if (currentProjectName.trim() || currentProjectCode.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current Cash Advance value",
      label: currentProjectCode || currentProjectName,
      name: currentProjectName || currentProjectCode,
      value: currentProjectName || currentProjectCode,
    });
  }

  return options;
}

export function createCashAdvanceResponsibilityCenterDropdownOptions({
  centers,
}: {
  centers: ResponsibilityCenter[];
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [];

  centers
    .filter((center) => center.status === "Active")
    .forEach((center) => {
      addUniqueDropdownOption(options, {
        description: center.financialType,
        label: center.code,
        name: center.name,
        value: center.name,
      });
    });

  return options;
}

export function createCashAdvanceProjectInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  const projectType = types.find((type) => type.name === "Project");
  const projectClassification = classifications.find((classification) => classification.id === projectType?.classificationId);
  const costCenterClassification = classifications.find((classification) => classification.name === "Cost Center");
  const classification = projectClassification ?? costCenterClassification;

  return {
    ...ResponsibilityCenterInitialFormValues,
    category: "Project",
    classificationId: classification?.id ?? "",
    financialType: classification?.name ?? "Cost Center",
    typeId: projectType?.id ?? "",
  };
}

export function createCashAdvanceResponsibilityCenterInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  const responsibilityCenterClassification =
    classifications.find((classification) => classification.name === "Cost Center") ?? classifications[0];
  const responsibilityCenterType = types.find((type) => type.classificationId === responsibilityCenterClassification?.id);

  return {
    ...ResponsibilityCenterInitialFormValues,
    classificationId: responsibilityCenterClassification?.id ?? "",
    financialType: responsibilityCenterClassification?.name ?? "",
    typeId: responsibilityCenterType?.id ?? "",
  };
}

export function createCashAdvanceApprovalRecord(record: CashAdvanceRecord | null): CashAdvanceRecord | null {
  if (!record) {
    return null;
  }

  return {
    accountCode: record.accountCode,
    accountTitle: record.accountTitle,
    amount: record.amount,
    costCenter: record.costCenter,
    createdAt: record.createdAt,
    createdBy: record.createdBy,
    documentDate: record.documentDate,
    id: record.id,
    partyCode: record.partyCode,
    partyName: record.partyName,
    remarks: record.remarks,
    status: record.status,
    transNo: record.transNo,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
  };
}

function normalizeCashAdvanceStatus(value: string): CashAdvanceStatus {
  if (value === CashAdvanceStatuses.Open) {
    return CashAdvanceStatuses.ForApproval;
  }

  const statuses: CashAdvanceStatus[] = [
    CashAdvanceStatuses.Cancelled,
    CashAdvanceStatuses.Disapproved,
    CashAdvanceStatuses.Draft,
    CashAdvanceStatuses.ForApproval,
    CashAdvanceStatuses.Posted,
  ];

  return statuses.includes(value as CashAdvanceStatus) ? (value as CashAdvanceStatus) : CashAdvanceStatuses.ForApproval;
}

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim() || options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}
