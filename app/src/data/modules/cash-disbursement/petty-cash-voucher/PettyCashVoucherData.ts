import type {
  PettyCashVoucherFormValues,
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import {
  PettyCashVoucherDefaultFormStatus,
  PettyCashVoucherDefaultVATable,
  PettyCashVoucherTransactionNumberPadding,
  PettyCashVoucherTransactionPrefix,
  PettyCashVoucherVatRate,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import {
  DisbursementVoucherDefaultAccounts,
  DisbursementVoucherResponsibilityCenterOptions,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  formatMoneyNumberDisplayValue,
  parseMoneyNumberInput,
} from "@/app/src/data/shared/money/MoneyNumberData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { todayDateValue } from "@/app/src/utils/date.util";

export const PettyCashVoucherRecords: PettyCashVoucherRecord[] = [
  {
    id: "1",
    voucherNo: "PCV-000001",
    partyCode: "PTY-1098",
    partyName: "Waldo Enterprises",
    accountCode: "101-200",
    accountTitle: "Petty Cash Fund",
    amount: 12500,
    documentDate: "2026-05-21",
    remarks: "Branch operating supplies",
    createdBy: "Maria Santos",
    dateCreated: "2026-05-21T09:00:00",
    updatedBy: "Jon Reyes",
    dateModified: "2026-05-21T10:15:00",
    status: "For Approval",
  },
  {
    id: "2",
    voucherNo: "PCV-000002",
    partyCode: "PTY-1134",
    partyName: "Pacific Supplies",
    accountCode: "101-300",
    accountTitle: "Petty Cash Fund",
    amount: 8320.5,
    documentDate: "2026-05-18",
    remarks: "Courier and representation expenses",
    createdBy: "Maria Santos",
    dateCreated: "2026-05-18T14:20:00",
    updatedBy: "Lea Cruz",
    dateModified: "2026-05-19T08:30:00",
    status: "Posted",
  },
  {
    id: "3",
    voucherNo: "PCV-000003",
    partyCode: "PTY-1210",
    partyName: "Greenfield Logistics",
    accountCode: "101-210",
    accountTitle: "Cash on Hand",
    amount: 4200,
    documentDate: "2026-05-14",
    remarks: "Cancelled duplicate voucher",
    createdBy: "Jon Reyes",
    dateCreated: "2026-05-14T11:45:00",
    updatedBy: "Jon Reyes",
    dateModified: "2026-05-14T13:10:00",
    status: "Cancelled",
  },
  {
    id: "4",
    voucherNo: "PCV-000004",
    partyCode: "PTY-1042",
    partyName: "Northstar Office Mart",
    accountCode: "101-200",
    accountTitle: "Petty Cash Fund",
    amount: 2680.75,
    documentDate: "2026-05-22",
    remarks: "Draft request for office pantry items",
    createdBy: "Lea Cruz",
    dateCreated: "2026-05-22T08:45:00",
    updatedBy: "Lea Cruz",
    dateModified: "2026-05-22T08:45:00",
    status: "Draft",
  },
  {
    id: "5",
    voucherNo: "PCV-000005",
    partyCode: "PTY-1187",
    partyName: "Metro Fuel Services",
    accountCode: "101-210",
    accountTitle: "Cash on Hand",
    amount: 5900,
    documentDate: "2026-05-20",
    remarks: "Fuel reimbursement missing supporting receipt",
    createdBy: "Jon Reyes",
    dateCreated: "2026-05-20T13:25:00",
    updatedBy: "Maria Santos",
    dateModified: "2026-05-20T16:40:00",
    status: "Disapproved",
  },
  {
    id: "6",
    voucherNo: "PCV-000006",
    partyCode: "PTY-1255",
    partyName: "Harborline Transport",
    accountCode: "101-300",
    accountTitle: "Petty Cash Fund",
    amount: 1475,
    documentDate: "2026-05-19",
    remarks: "Parking and toll replenishment",
    createdBy: "Ana Lim",
    dateCreated: "2026-05-19T10:10:00",
    updatedBy: "Ana Lim",
    dateModified: "2026-05-19T10:55:00",
    status: "For Approval",
  },
  {
    id: "7",
    voucherNo: "PCV-000007",
    partyCode: "PTY-1311",
    partyName: "Evergreen Hardware",
    accountCode: "101-200",
    accountTitle: "Petty Cash Fund",
    amount: 3650.25,
    documentDate: "2026-05-17",
    remarks: "Minor branch repairs and maintenance",
    createdBy: "Lea Cruz",
    dateCreated: "2026-05-17T15:05:00",
    updatedBy: "Jon Reyes",
    dateModified: "2026-05-18T09:35:00",
    status: "Posted",
  },
  {
    id: "8",
    voucherNo: "PCV-000008",
    partyCode: "PTY-1402",
    partyName: "BrightPrint Solutions",
    accountCode: "101-210",
    accountTitle: "Cash on Hand",
    amount: 980,
    documentDate: "2026-05-16",
    remarks: "Draft voucher for emergency printing",
    createdBy: "Ana Lim",
    dateCreated: "2026-05-16T11:30:00",
    updatedBy: "Ana Lim",
    dateModified: "2026-05-16T11:30:00",
    status: "Draft",
  },
];

export const PettyCashVoucherCopySources = ["Petty Cash Voucher"] as const;

export const PettyCashVoucherCopyFromRecords: AppCopyFromRecord[] = PettyCashVoucherRecords.map((record) => ({
  amount: formatMoneyNumberDisplayValue(String(record.amount)),
  documentDate: record.documentDate,
  id: record.id,
  partyName: record.partyName,
  remarks: record.remarks,
  source: PettyCashVoucherCopySources[0],
  sourceNo: record.voucherNo,
}));

export const PettyCashVoucherPartyOptions: AppAdvancedDropdownOption[] = [
  { label: "PTY-1098", name: "Waldo Enterprises", value: "PTY-1098" },
  { label: "PTY-1134", name: "Pacific Supplies", value: "PTY-1134" },
  { label: "PTY-1210", name: "Greenfield Logistics", value: "PTY-1210" },
  { label: "PTY-1042", name: "Northstar Office Mart", value: "PTY-1042" },
  { label: "PTY-1187", name: "Metro Fuel Services", value: "PTY-1187" },
  { label: "PTY-1255", name: "Harborline Transport", value: "PTY-1255" },
  { label: "PTY-1311", name: "Evergreen Hardware", value: "PTY-1311" },
  { label: "PTY-1402", name: "BrightPrint Solutions", value: "PTY-1402" },
];

export const PettyCashVoucherInitialFormValues: PettyCashVoucherFormValues = {
  accountCode: "",
  accountTitle: "",
  amount: "",
  attachments: [],
  documentDate: todayDateValue(),
  netAmount: "",
  remarks: "",
  responsibilityCenter: "",
  responsibilityCenterCode: "",
  status: PettyCashVoucherDefaultFormStatus,
  transactionNo: createNextPettyCashVoucherNumber(),
  vatable: PettyCashVoucherDefaultVATable,
  vatAmount: "",
  partyCode: "",
  partyName: "",
};

export function createPettyCashVoucherInitialFormValues(): PettyCashVoucherFormValues {
  return {
    ...PettyCashVoucherInitialFormValues,
    transactionNo: createNextPettyCashVoucherNumber(),
  };
}

export function createPettyCashVoucherFormValues(
  record: PettyCashVoucherRecord,
): PettyCashVoucherFormValues {
  return {
    ...PettyCashVoucherInitialFormValues,
    accountCode: record.accountCode,
    accountTitle: record.accountTitle,
    amount: formatMoneyNumberDisplayValue(String(record.amount)),
    documentDate: record.documentDate,
    netAmount: formatMoneyNumberDisplayValue(String(record.amount)),
    remarks: record.remarks,
    status: record.status,
    transactionNo: record.voucherNo,
    partyCode: record.partyCode,
    partyName: record.partyName,
  };
}

export function createPettyCashVoucherRecord(
  values: PettyCashVoucherFormValues,
  status: PettyCashVoucherStatus,
  existingRecord?: PettyCashVoucherRecord,
): PettyCashVoucherRecord {
  const updatedAt = new Date().toISOString();

  return {
    accountCode: values.accountCode.trim(),
    accountTitle: values.accountTitle.trim(),
    amount: parseMoneyNumberInput(values.amount),
    createdBy: existingRecord?.createdBy ?? "Current User",
    dateCreated: existingRecord?.dateCreated ?? updatedAt,
    dateModified: updatedAt,
    documentDate: values.documentDate,
    id: existingRecord?.id ?? `pcv-${values.transactionNo.toLowerCase()}`,
    partyCode: values.partyCode.trim(),
    partyName: values.partyName.trim(),
    remarks: values.remarks.trim(),
    status,
    updatedBy: "Current User",
    voucherNo: values.transactionNo.trim(),
  };
}

export function calculatePettyCashVoucherVatFields(
  amountValue: string,
  vatable: PettyCashVoucherFormValues["vatable"],
) {
  const amount = parseMoneyNumberInput(amountValue);

  if (vatable === "True") {
    const vatAmount = amount * PettyCashVoucherVatRate;

    return {
      netAmount: formatPettyCashVoucherAmount(Math.max(amount - vatAmount, 0)),
      vatAmount: formatPettyCashVoucherAmount(vatAmount),
    };
  }

  return {
    netAmount: formatPettyCashVoucherAmount(amount),
    vatAmount: "0.00",
  };
}

export function createPettyCashVoucherPartyOptions(
  values: PettyCashVoucherFormValues,
): AppAdvancedDropdownOption[] {
  return includeCurrentOption([...PettyCashVoucherPartyOptions], {
    label: values.partyCode,
    name: values.partyName,
    value: values.partyCode,
  });
}

export function createPettyCashVoucherAccountOptions(
  values: PettyCashVoucherFormValues,
): AppAdvancedDropdownOption[] {
  const options = DisbursementVoucherDefaultAccounts.flatMap((account) =>
    account.generatedAccounts.map((generatedAccount) => ({
      label: generatedAccount.accountCode,
      name: generatedAccount.accountTitle,
      value: generatedAccount.accountTitle,
    })),
  );

  return includeCurrentOption(options, {
    label: values.accountCode,
    name: values.accountTitle,
    value: values.accountTitle,
  });
}

export function createPettyCashVoucherResponsibilityCenterOptions(
  values: PettyCashVoucherFormValues,
): AppAdvancedDropdownOption[] {
  return includeCurrentOption([...DisbursementVoucherResponsibilityCenterOptions], {
    label: values.responsibilityCenterCode,
    name: values.responsibilityCenter,
    value: values.responsibilityCenterCode,
  });
}

function includeCurrentOption(
  options: AppAdvancedDropdownOption[],
  currentOption: AppAdvancedDropdownOption,
) {
  if (!currentOption.value || !currentOption.name) {
    return options;
  }

  if (options.some((option) => option.value === currentOption.value)) {
    return options;
  }

  return [...options, currentOption];
}

function formatPettyCashVoucherAmount(value: number) {
  return formatMoneyNumberDisplayValue(value.toFixed(2));
}

function createNextPettyCashVoucherNumber() {
  const nextSequence =
    PettyCashVoucherRecords.reduce((highestSequence, record) => {
      const matchedParts = record.voucherNo.match(
        new RegExp(`^${PettyCashVoucherTransactionPrefix}-(\\d+)$`),
      );
      const sequence = matchedParts ? Number.parseInt(matchedParts[1], 10) : 0;

      return Number.isFinite(sequence)
        ? Math.max(highestSequence, sequence)
        : highestSequence;
    }, 0) + 1;

  return `${PettyCashVoucherTransactionPrefix}-${String(nextSequence).padStart(
    PettyCashVoucherTransactionNumberPadding,
    "0",
  )}`;
}
