"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  AccountsPayableVoucherAccountingColumnIds,
  AccountsPayableVoucherExpenseColumnIds,
  AccountsPayableVoucherPurchaseTransactionType,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { formatAccountsPayableVoucherAmount } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import type { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";
import type {
  AccountsPayableVoucherAccountingColumnId,
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherExpenseColumnId,
  AccountsPayableVoucherExpenseLine,
  AccountsPayableVoucherLookupParty,
  AccountsPayableVoucherLookupResponsibilityCenter,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
  createVatOptions,
  getEwtPercentFromCode,
  getVatPercentFromRate,
  getVatRateFromCode,
} from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import { ModuleTextareaDialog } from "@/app/src/ui/shared/module/ModuleTextareaDialog";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  MoneyNumberField,
  formatMoneyNumberInput,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";

type PartyBearingRow = {
  partyCode: string;
  partyName: string;
};

const ManualInputVatAccountingEntryIdPrefix = "apv-entry-manual-input-vat-";
const ManualEwtAccountingEntryIdPrefix = "apv-entry-manual-ewt-";
const ManualDefaultPayableAccountingEntryId = "apv-entry-manual-default-payable";
const PartyFallbackValuePrefix = "apv-party:";
const EntryDropdownBaseClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

export function isManualGeneratedTaxAccountingEntry(
  entry: AccountsPayableVoucherAccountingEntry,
) {
  return (
    entry.id.startsWith(ManualInputVatAccountingEntryIdPrefix) ||
    entry.id.startsWith(ManualEwtAccountingEntryIdPrefix) ||
    entry.id === ManualDefaultPayableAccountingEntryId
  );
}

export function applyExpenseLinePartyTaxDefaults(
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>,
  lineId: string,
  party: AccountsPayableVoucherLookupParty | undefined,
  taxCodes: Parameters<typeof createVatOptions>[0],
) {
  if (!party) {
    return;
  }

  const defaults = getPartyPurchaseTaxDefaults(party, taxCodes);

  if (!party.defaultPurchaseInputVatTaxSourceKey || defaults.inputVatCode) {
    page.updateExpenseLine(lineId, "vat", defaults.inputVatCode);
    page.updateExpenseLine(lineId, "vatPercent", defaults.inputVatPercent);
  }

  if (!party.defaultPurchaseEwtTaxSourceKey || defaults.ewtCode) {
    page.updateExpenseLine(lineId, "ewt", defaults.ewtCode);
    page.updateExpenseLine(lineId, "ewtPercent", defaults.ewtPercent);
  }
}

export function applyAccountingEntryPartyTaxDefaults(
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>,
  entryId: string,
  party: AccountsPayableVoucherLookupParty | undefined,
  taxCodes: Parameters<typeof createVatOptions>[0],
) {
  if (!party) {
    return;
  }

  const defaults = getPartyPurchaseTaxDefaults(party, taxCodes);

  if (!party.defaultPurchaseInputVatTaxSourceKey || defaults.inputVatCode) {
    page.updateAccountingEntry(entryId, "vatType", defaults.inputVatCode);
  }

  if (!party.defaultPurchaseEwtTaxSourceKey || defaults.ewtCode) {
    page.updateAccountingEntry(entryId, "atcCode", defaults.ewtCode);
  }
}

function getPartyPurchaseTaxDefaults(
  party: AccountsPayableVoucherLookupParty,
  taxCodes: Parameters<typeof createVatOptions>[0],
) {
  const inputVatCode = getTaxCodeBySourceKey(
    taxCodes,
    party.defaultPurchaseInputVatTaxSourceKey,
    "INPUT VAT",
  );
  const ewtCode = getTaxCodeBySourceKey(taxCodes, party.defaultPurchaseEwtTaxSourceKey, "EWT");
  const inputVatRate = getVatRateFromCode(inputVatCode, taxCodes);

  return {
    ewtCode,
    ewtPercent: getEwtPercentFromCode(ewtCode, taxCodes),
    inputVatCode,
    inputVatPercent: getVatPercentFromRate(inputVatRate),
  };
}

function getTaxCodeBySourceKey(
  taxCodes: Parameters<typeof createVatOptions>[0],
  sourceKey: string,
  taxType: "EWT" | "INPUT VAT",
) {
  if (!sourceKey) {
    return "";
  }

  return (
    taxCodes.find(
      (taxCode) =>
        taxCode.sourceKey === sourceKey &&
        taxCode.transactionType === AccountsPayableVoucherPurchaseTransactionType &&
        taxCode.taxType === taxType,
    )?.taxCode ?? ""
  );
}

export function findPartyRecordByCode(
  partyRecords: AccountsPayableVoucherLookupParty[],
  partyCode: string,
) {
  return partyRecords.find((record) => record.partyCodeNo === partyCode);
}

export function PartyDropdown({
  canAddPartyName,
  isReadonly,
  onAddPartyName,
  onSelect,
  options,
  partyCode,
  partyName,
}: {
  canAddPartyName: boolean;
  isReadonly: boolean;
  onAddPartyName: () => void;
  onSelect: (partyCode: string, partyName: string) => void;
  options: AppAdvancedDropdownOption[];
  partyCode: string;
  partyName: string;
}) {
  return (
    <AppAdvancedDropdown
      addAction={
        !isReadonly && canAddPartyName
          ? {
              label: "Add Party Name",
              onClick: onAddPartyName,
            }
          : undefined
      }
      value={partyCode || getPartyFallbackValue(partyName)}
      readOnly={isReadonly}
      options={options}
      placeholder="Select Party Name"
      searchPlaceholder="Search Party Name"
      className={entryDropdownClassName()}
      showSelectedDetails
      onChange={(value) => {
        const selectedValue = String(value);
        const party = options.find((option) => option.value === selectedValue);
        const isFallbackValue = selectedValue.startsWith(PartyFallbackValuePrefix);

        onSelect(
          isFallbackValue ? "" : (party?.value ?? ""),
          party?.name ?? (isFallbackValue ? selectedValue : ""),
        );
      }}
    />
  );
}

export function ParticularsCell({
  error,
  isReadonly,
  onOpen,
  onUpdate,
  value,
}: {
  error?: string;
  isReadonly: boolean;
  onOpen: () => void;
  onUpdate: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem]">
      <LineInput error={error} value={value} onChange={onUpdate} readOnly={isReadonly} />
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-10 items-center justify-center border-l border-darknavy/10 bg-white text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35"
        aria-label="Open particulars"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ResponsibilityCenterDropdown({
  isReadonly,
  onChange,
  options,
  value,
}: {
  isReadonly: boolean;
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  value: string;
}) {
  return (
    <AppAdvancedDropdown
      value={value}
      readOnly={isReadonly}
      options={options}
      placeholder="Select responsibility center"
      searchPlaceholder="Search responsibility center"
      className={entryDropdownClassName()}
      onChange={(nextValue) => onChange(String(nextValue))}
    />
  );
}

export function LineInput({
  disabled = false,
  error,
  onChange,
  readOnly = false,
  value,
}: {
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      title={error}
      className={entryCellControlClassName(error ? "ring-2 ring-inset ring-red-500/45" : "")}
    />
  );
}

export function LineAmountInput({
  allowNegative = true,
  disabled,
  error,
  onChange,
  value,
}: {
  allowNegative?: boolean;
  disabled: boolean;
  error?: string;
  onChange: (value: number) => void;
  value: number;
}) {
  const [draftValue, setDraftValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const displayValue = isEditing
    ? draftValue
    : value !== 0
      ? formatMoneyNumberInput(value.toFixed(2), true)
      : "";

  function handleValueChange(nextValue: string) {
    setDraftValue(nextValue);
    onChange(parseMoneyNumberInput(nextValue));
  }

  return (
    <MoneyNumberField
      allowNegative={allowNegative}
      value={displayValue}
      onValueChange={handleValueChange}
      onFocus={() => {
        setDraftValue(displayValue);
        setIsEditing(true);
      }}
      onBlur={() => {
        setDraftValue("");
        setIsEditing(false);
      }}
      disabled={disabled}
      title={error}
      className={entryCellControlClassName(
        joinClasses("text-right tabular-nums", error ? "ring-2 ring-inset ring-red-500/45" : ""),
      )}
    />
  );
}

export function ExpenseDetailValue({ suffix = "", value }: { suffix?: string; value: number }) {
  return (
    <div className="flex h-10 w-full items-center justify-end bg-offwhite/45 px-3 text-sm font-medium tabular-nums text-darknavy/70">
      {formatAccountsPayableVoucherAmount(value)}
      {suffix}
    </div>
  );
}

export function ParticularsEditorDialog({
  isOpen,
  isReadonly,
  onClose,
  onSave,
  subtitle,
  textareaId,
  value,
}: {
  isOpen: boolean;
  isReadonly: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  subtitle: string;
  textareaId: string;
  value: string;
}) {
  return (
    <ModuleTextareaDialog
      isOpen={isOpen}
      isReadonly={isReadonly}
      title="Particulars"
      subtitle={subtitle}
      textareaId={textareaId}
      value={value}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

export function entryDropdownClassName(error?: string) {
  return joinClasses(
    EntryDropdownBaseClassName,
    error &&
      "[&_.app-advanced-dropdown-control]:ring-2 [&_.app-advanced-dropdown-control]:ring-inset [&_.app-advanced-dropdown-control]:ring-red-500/45",
  );
}

function entryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

function getPartyFallbackValue(partyName: string) {
  const normalizedPartyName = partyName.trim().toLowerCase();

  return normalizedPartyName ? `${PartyFallbackValuePrefix}${normalizedPartyName}` : "";
}

export function createPartyOptions(
  partyRecords: AccountsPayableVoucherLookupParty[],
  rows: PartyBearingRow[],
): AppAdvancedDropdownOption[] {
  const options = partyRecords.map((party) => ({
    description: party.partyTypes.join(", "),
    label: party.partyCodeNo,
    name: party.name,
    value: party.partyCodeNo,
  }));
  const optionNames = new Set(options.map((option) => option.name.toLowerCase()));
  const optionValues = new Set(options.map((option) => option.value));
  const customOptions: AppAdvancedDropdownOption[] = [];

  rows.forEach((row) => {
    const partyName = row.partyName.trim();
    const value = row.partyCode || getPartyFallbackValue(partyName);

    if (!partyName || optionNames.has(partyName.toLowerCase()) || optionValues.has(value)) {
      return;
    }

    optionValues.add(value);
    customOptions.push({
      description: "Copied entry party",
      label: row.partyCode,
      name: partyName,
      value,
    });
  });

  return [...options, ...customOptions];
}

export function createResponsibilityCenterOptions(
  responsibilityCenters: AccountsPayableVoucherLookupResponsibilityCenter[],
  rows: Array<{ responsibilityCenter: string }>,
): AppAdvancedDropdownOption[] {
  const options = responsibilityCenters
    .filter((center) => center.status === "ACTIVE")
    .map((center) => ({
      description: center.typeName,
      label: center.code,
      name: center.name,
      value: center.name,
    }));
  const optionValues = new Set(options.map((option) => option.value));
  const customOptions: AppAdvancedDropdownOption[] = [];

  rows.forEach((row) => {
    const responsibilityCenter = row.responsibilityCenter.trim();

    if (!responsibilityCenter || optionValues.has(responsibilityCenter)) {
      return;
    }

    optionValues.add(responsibilityCenter);
    customOptions.push({
      description: "Copied responsibility center",
      label: responsibilityCenter,
      name: responsibilityCenter,
      value: responsibilityCenter,
    });
  });

  return [...options, ...customOptions];
}

export function isExpenseColumnId(
  columnId: string,
): columnId is AccountsPayableVoucherExpenseColumnId {
  return AccountsPayableVoucherExpenseColumnIds.includes(
    columnId as AccountsPayableVoucherExpenseColumnId,
  );
}

export function isAccountingColumnId(
  columnId: string,
): columnId is AccountsPayableVoucherAccountingColumnId {
  return AccountsPayableVoucherAccountingColumnIds.includes(
    columnId as AccountsPayableVoucherAccountingColumnId,
  );
}

function getExpenseExportCell(
  line: AccountsPayableVoucherExpenseLine,
  columnId: AccountsPayableVoucherExpenseColumnId,
) {
  if (isExpenseAmountColumn(columnId)) {
    return Number(line[columnId] || 0) > 0 ? Number(line[columnId] || 0).toFixed(2) : "";
  }

  return String(line[columnId] ?? "");
}

function isExpenseAmountColumn(columnId: AccountsPayableVoucherExpenseColumnId) {
  return (
    columnId === "amount" ||
    columnId === "netAmount" ||
    columnId === "vatPercent" ||
    columnId === "vatAmount" ||
    columnId === "ewtPercent" ||
    columnId === "ewtAmount" ||
    columnId === "totalAmountDue"
  );
}

export function getExpenseColumnTotal(
  lines: AccountsPayableVoucherExpenseLine[],
  columnId: "amount" | "ewtAmount" | "netAmount" | "totalAmountDue" | "vatAmount",
) {
  return lines.reduce((sum, line) => sum + Number(line[columnId] || 0), 0);
}

function getAccountingExportCell(
  entry: AccountsPayableVoucherAccountingEntry,
  columnId: AccountsPayableVoucherAccountingColumnId,
) {
  switch (columnId) {
    case "debit":
    case "credit":
      return entry[columnId] > 0 ? entry[columnId].toFixed(2) : "";
    default:
      return String(entry[columnId] ?? "");
  }
}

export function calculateExpenseColumnFitWidth({
  columnId,
  columnLabels,
  lines,
}: {
  columnId: AccountsPayableVoucherExpenseColumnId;
  columnLabels: Record<AccountsPayableVoucherExpenseColumnId, string>;
  lines: AccountsPayableVoucherExpenseLine[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = lines.reduce(
    (currentWidth, line) =>
      Math.max(currentWidth, estimateTextWidth(String(getExpenseExportCell(line, columnId)), 24)),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

export function calculateAccountingColumnFitWidth({
  columnId,
  columnLabels,
  entries,
}: {
  columnId: AccountsPayableVoucherAccountingColumnId;
  columnLabels: Record<AccountsPayableVoucherAccountingColumnId, string>;
  entries: AccountsPayableVoucherAccountingEntry[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = entries.reduce(
    (currentWidth, entry) =>
      Math.max(
        currentWidth,
        estimateTextWidth(String(getAccountingExportCell(entry, columnId)), 24),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}

export function moveColumnId<TColumnId extends string>(
  columnOrder: TColumnId[],
  fromColumnId: TColumnId,
  toColumnId: TColumnId,
) {
  const fromIndex = columnOrder.indexOf(fromColumnId);
  const toIndex = columnOrder.indexOf(toColumnId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return columnOrder;
  }

  const nextOrder = [...columnOrder];
  const [movedColumn] = nextOrder.splice(fromIndex, 1);

  nextOrder.splice(toIndex, 0, movedColumn);
  return nextOrder;
}

export function updateVisibleColumnIds<TColumnId extends string>(
  visibleColumnIds: TColumnId[],
  columnOrder: TColumnId[],
  columnId: TColumnId,
  isVisible: boolean,
) {
  if (isVisible) {
    const nextVisibleIds = new Set([...visibleColumnIds, columnId]);

    return columnOrder.filter((currentColumnId) => nextVisibleIds.has(currentColumnId));
  }

  if (visibleColumnIds.length <= 1) {
    return visibleColumnIds;
  }

  return visibleColumnIds.filter((currentColumnId) => currentColumnId !== columnId);
}
