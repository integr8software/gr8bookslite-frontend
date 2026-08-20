import {
  CashAdvanceMultipleEntryStatuses,
  CashAdvanceMultipleEntryStorageKey,
  CashAdvanceMultipleEntryTransactionNumberPadding,
  CashAdvanceMultipleEntryTransactionNumberPrefix,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { DisbursementVoucherProjectOptions } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { ResponsibilityCenterInitialFormValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import type {
  CashAdvanceMultipleEntryAccountingEntry,
  CashAdvanceMultipleEntryFormValues,
  CashAdvanceMultipleEntryItem,
  CashAdvanceMultipleEntryRecord,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type {
  ResponsibilityCenter,
  ResponsibilityCenterClassification,
  ResponsibilityCenterFormValues,
  ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { parseFiniteNumber } from "@/app/src/utils/number.util";

export const CashAdvanceMultipleEntryPartyOptions = [
  { label: "EMP-0017", name: "Maria Santos", value: "EMP-0017" },
  { label: "EMP-0042", name: "Jose Ramirez", value: "EMP-0042" },
  { label: "EMP-0025", name: "Angela Cruz", value: "EMP-0025" },
  { label: "V000099", name: "Arjay Capili", value: "V000099" },
  { label: "00002", name: "Archipelago Phil Seafarers Training Institute", value: "00002" },
];

export const CashAdvanceMultipleEntryResponsibilityCenterOptions = [
  { label: "Operations", name: "Operations", value: "Operations" },
  { label: "Admin", name: "Admin", value: "Admin" },
  { label: "Sales", name: "Sales", value: "Sales" },
  { label: "1", name: "1", value: "1" },
];

export const MockCashAdvanceMultipleEntryRecords: CashAdvanceMultipleEntryRecord[] = [
  {
    accountCode: "1130-CA",
    accountTitle: "Cash Advance",
    amount: 100,
    costCenter: "1",
    createdAt: "2026-01-22T08:00:00.000Z",
    createdBy: "Current User",
    documentDate: "2026-01-22",
    id: "came-001",
    partyCode: "00002",
    partyName: "Archipelago Phil Seafarers Training Institute",
    projectCode: "",
    remarks: "",
    status: CashAdvanceMultipleEntryStatuses.forApproval,
    transNo: "CAME-000001",
    updatedAt: "2026-01-22T08:00:00.000Z",
    updatedBy: "Current User",
  },
  {
    accountCode: "1130-CA",
    accountTitle: "Cash Advance",
    amount: 12500,
    costCenter: "Operations",
    createdAt: "2026-01-21T08:00:00.000Z",
    createdBy: "Maria Santos",
    documentDate: "2026-01-21",
    id: "came-002",
    partyCode: "EMP-0017",
    partyName: "Maria Santos",
    projectCode: "",
    remarks: "Project site travel and meal allowance.",
    status: CashAdvanceMultipleEntryStatuses.draft,
    transNo: "CAME-000002",
    updatedAt: "2026-01-21T08:00:00.000Z",
    updatedBy: "Maria Santos",
  },
  {
    accountCode: "1130-CA",
    accountTitle: "Cash Advance",
    amount: 8200,
    costCenter: "Admin",
    createdAt: "2026-01-20T08:00:00.000Z",
    createdBy: "Jose Ramirez",
    documentDate: "2026-01-20",
    id: "came-003",
    partyCode: "EMP-0042",
    partyName: "Jose Ramirez",
    projectCode: "",
    remarks: "Office supplies purchase advance.",
    status: CashAdvanceMultipleEntryStatuses.posted,
    transNo: "CAME-000003",
    updatedAt: "2026-01-20T10:30:00.000Z",
    updatedBy: "Finance Reviewer",
  },
  {
    accountCode: "1135-OA",
    accountTitle: "Other Advances",
    amount: 30000,
    costCenter: "Sales",
    createdAt: "2026-01-19T08:00:00.000Z",
    createdBy: "Angela Cruz",
    documentDate: "2026-01-19",
    id: "came-004",
    partyCode: "EMP-0025",
    partyName: "Angela Cruz",
    projectCode: "",
    remarks: "Client visit representation budget.",
    status: CashAdvanceMultipleEntryStatuses.disapproved,
    transNo: "CAME-000004",
    updatedAt: "2026-01-19T11:15:00.000Z",
    updatedBy: "Finance Reviewer",
  },
  {
    accountCode: "1135-OA",
    accountTitle: "Other Advances",
    amount: 4500,
    costCenter: "Operations",
    createdAt: "2026-01-18T08:00:00.000Z",
    createdBy: "Arjay Capili",
    documentDate: "2026-01-18",
    id: "came-005",
    partyCode: "V000099",
    partyName: "Arjay Capili",
    projectCode: "",
    remarks: "Cancelled local transport advance.",
    status: CashAdvanceMultipleEntryStatuses.cancelled,
    transNo: "CAME-000005",
    updatedAt: "2026-01-18T09:45:00.000Z",
    updatedBy: "Finance Reviewer",
  },
];

export function createBlankCashAdvanceMultipleEntryItem(values: Partial<CashAdvanceMultipleEntryItem> = {}): CashAdvanceMultipleEntryItem {
  return {
    amount: "",
    cashAdvanceBalance: "",
    id: `came-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    remarks: "",
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    ...values,
  };
}

export function createBlankCashAdvanceMultipleEntryAccountingEntry(
  values: Partial<CashAdvanceMultipleEntryAccountingEntry> = {},
): CashAdvanceMultipleEntryAccountingEntry {
  return {
    accountCode: "",
    accountTitle: "",
    credit: "",
    debit: "",
    id: `came-accounting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    remarks: "",
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    ...values,
  };
}

export function createCashAdvanceMultipleEntryFormValues(baseCurrencyCode = "PHP"): CashAdvanceMultipleEntryFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    accountCode: "",
    accountTitle: "",
    accountingEntries: [createBlankCashAdvanceMultipleEntryAccountingEntry()],
    attachments: [],
    contractNo: "",
    costCenter: "",
    currency: baseCurrencyCode,
    documentDate: today,
    exchangeRate: "1.00",
    items: [createBlankCashAdvanceMultipleEntryItem()],
    partyCode: "",
    partyName: "",
    projectCode: "",
    projectRef: "",
    remarks: "",
    status: CashAdvanceMultipleEntryStatuses.open,
    totalAmount: "",
    transNo: createNextCashAdvanceMultipleEntryTransNo(),
  };
}

export function createCashAdvanceMultipleEntryFormValuesFromRecord(
  record: CashAdvanceMultipleEntryRecord,
): CashAdvanceMultipleEntryFormValues {
  if (record.formValues) {
    return {
      ...createCashAdvanceMultipleEntryFormValues(),
      ...record.formValues,
      items: record.formValues.items.map((item) => ({
        ...item,
        cashAdvanceBalance: item.cashAdvanceBalance ?? "",
      })),
      projectCode: record.formValues.projectCode ?? record.projectCode ?? "",
      status: normalizeCashAdvanceMultipleEntryStatus(record.formValues.status),
      transNo: record.formValues.transNo || record.transNo,
    };
  }

  return {
    ...createCashAdvanceMultipleEntryFormValues(),
    accountCode: record.accountCode,
    accountTitle: record.accountTitle,
    costCenter: record.costCenter,
    documentDate: record.documentDate,
    partyCode: record.partyCode,
    partyName: record.partyName,
    projectCode: record.projectCode ?? "",
    remarks: record.remarks,
    status: normalizeCashAdvanceMultipleEntryStatus(record.status),
    totalAmount: String(record.amount || ""),
    transNo: record.transNo,
  };
}

export function createCashAdvanceMultipleEntryRecordFromForm(
  values: CashAdvanceMultipleEntryFormValues,
  existingRecord?: CashAdvanceMultipleEntryRecord,
): CashAdvanceMultipleEntryRecord {
  const now = new Date().toISOString();
  const actor = "Current User";
  const transNo = createCashAdvanceMultipleEntryTransNo(values.transNo, existingRecord);
  const amount = calculateCashAdvanceMultipleEntryTotal(values.items);

  return {
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    amount,
    costCenter: values.costCenter,
    createdAt: existingRecord?.createdAt ?? now,
    createdBy: existingRecord?.createdBy ?? actor,
    documentDate: values.documentDate,
    formValues: {
      ...values,
      attachments: values.attachments.map((attachment) => ({ ...attachment })),
      transNo,
      totalAmount: formatCashAdvanceMultipleEntryAmount(amount),
    },
    id: existingRecord?.id ?? `came-${Date.now()}`,
    partyCode: values.partyCode,
    partyName: values.partyName,
    projectCode: values.projectCode,
    remarks: values.remarks,
    status: normalizeCashAdvanceMultipleEntryStatus(values.status),
    transNo,
    updatedAt: now,
    updatedBy: actor,
  };
}

export function calculateCashAdvanceMultipleEntryTotal(rows: CashAdvanceMultipleEntryItem[]) {
  return rows.reduce((total, row) => total + parseFiniteNumber(row.amount), 0);
}

export function formatCashAdvanceMultipleEntryAmount(value: number | string) {
  return parseFiniteNumber(value).toFixed(2);
}

export function getInitialCashAdvanceMultipleEntries() {
  return readStoredCashAdvanceMultipleEntries() ?? MockCashAdvanceMultipleEntryRecords;
}

export function readStoredCashAdvanceMultipleEntries() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedRecords = window.localStorage.getItem(CashAdvanceMultipleEntryStorageKey);

  if (!storedRecords) {
    return null;
  }

  try {
    const parsedRecords = JSON.parse(storedRecords) as CashAdvanceMultipleEntryRecord[];

    return Array.isArray(parsedRecords) ? parsedRecords.map(normalizeStoredCashAdvanceMultipleEntryRecord) : null;
  } catch {
    return null;
  }
}

export function writeStoredCashAdvanceMultipleEntries(records: CashAdvanceMultipleEntryRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CashAdvanceMultipleEntryStorageKey, JSON.stringify(records));
}

export function countCashAdvanceMultipleEntriesByStatus(records: CashAdvanceMultipleEntryRecord[], status: CashAdvanceStatus) {
  return records.filter((record) => record.status === status).length;
}

export function createCashAdvanceMultipleEntryPartyOptions(
  currentPartyCode: string,
  currentPartyName: string,
): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...CashAdvanceMultipleEntryPartyOptions];

  if (currentPartyCode.trim() || currentPartyName.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current Cash Advance Multiple Entry value",
      label: currentPartyCode || "Current party",
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode || currentPartyName,
    });
  }

  return options;
}

export function createCashAdvanceMultipleEntrySelectOptions(
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

export function createCashAdvanceMultipleEntryProjectOptions({
  centers,
  currentProjectCode,
  currentProjectName,
}: {
  centers: ResponsibilityCenter[];
  currentProjectCode: string;
  currentProjectName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherProjectOptions];

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
      description: "Current Cash Advance Multiple Entry value",
      label: currentProjectCode || currentProjectName,
      name: currentProjectName || currentProjectCode,
      value: currentProjectName || currentProjectCode,
    });
  }

  return options;
}

export function createCashAdvanceMultipleEntryResponsibilityCenterDropdownOptions({
  centers,
}: {
  centers: ResponsibilityCenter[];
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...CashAdvanceMultipleEntryResponsibilityCenterOptions];

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

export function createCashAdvanceMultipleEntryProjectInitialValues(
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

export function createCashAdvanceMultipleEntryResponsibilityCenterInitialValues(
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

export function createCashAdvanceMultipleEntryApprovalRecord(record: CashAdvanceMultipleEntryRecord | null): CashAdvanceRecord | null {
  if (!record) {
    return null;
  }

  return {
    accountCode: record.accountCode,
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

function createCashAdvanceMultipleEntryTransNo(value: string, existingRecord?: CashAdvanceMultipleEntryRecord) {
  const normalizedValue = value.trim();

  if (normalizedValue) {
    return normalizedValue;
  }

  return createNextCashAdvanceMultipleEntryTransNo(existingRecord?.id);
}

function createNextCashAdvanceMultipleEntryTransNo(excludedRecordId?: string) {
  const existingNumbers = getInitialCashAdvanceMultipleEntries()
    .filter((record) => record.id !== excludedRecordId)
    .map((record) => parseCashAdvanceMultipleEntryTransNoSequence(record.transNo))
    .filter((sequence): sequence is number => sequence !== null);
  const nextSequence = Math.max(0, ...existingNumbers) + 1;

  return `${CashAdvanceMultipleEntryTransactionNumberPrefix}${String(nextSequence).padStart(CashAdvanceMultipleEntryTransactionNumberPadding, "0")}`;
}

function parseCashAdvanceMultipleEntryTransNoSequence(value: string) {
  const match = value.trim().match(/^CAME-(\d+)$/);

  return match ? Number(match[1]) : null;
}

function normalizeStoredCashAdvanceMultipleEntryRecord(record: CashAdvanceMultipleEntryRecord): CashAdvanceMultipleEntryRecord {
  return {
    ...record,
    projectCode: record.projectCode ?? record.formValues?.projectCode ?? "",
    createdAt: record.createdAt ?? record.documentDate,
    createdBy: record.createdBy ?? record.partyName,
    formValues: record.formValues
      ? {
          ...record.formValues,
          attachments: record.formValues.attachments ?? [],
          items: (record.formValues.items ?? []).map((item) => ({
            ...item,
            cashAdvanceBalance: item.cashAdvanceBalance ?? "",
          })),
          projectCode: record.formValues.projectCode ?? record.projectCode ?? "",
          status: normalizeCashAdvanceMultipleEntryStatus(record.formValues.status),
        }
      : record.formValues,
    status: normalizeCashAdvanceMultipleEntryStatus(record.status),
    updatedAt: record.updatedAt ?? record.createdAt ?? record.documentDate,
    updatedBy: record.updatedBy ?? record.createdBy ?? record.partyName,
  };
}

function normalizeCashAdvanceMultipleEntryStatus(value: string): CashAdvanceStatus {
  if (value === CashAdvanceMultipleEntryStatuses.open) {
    return CashAdvanceMultipleEntryStatuses.forApproval;
  }

  const statuses: CashAdvanceStatus[] = [
    CashAdvanceMultipleEntryStatuses.cancelled,
    CashAdvanceMultipleEntryStatuses.disapproved,
    CashAdvanceMultipleEntryStatuses.draft,
    CashAdvanceMultipleEntryStatuses.forApproval,
    CashAdvanceMultipleEntryStatuses.posted,
  ];

  return statuses.includes(value as CashAdvanceStatus) ? (value as CashAdvanceStatus) : CashAdvanceMultipleEntryStatuses.forApproval;
}

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim() || options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}
