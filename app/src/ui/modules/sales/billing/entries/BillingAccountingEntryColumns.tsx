import { BillingTaxTypeOptions, BillingVatTypeOptions } from "@/app/src/data/modules/sales/billing/BillingData";
import type { BillingAccountingColumnId, BillingAccountingEntry } from "@/app/src/types/modules/sales/billing/BillingTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { BillingEntryAmountInput, BillingEntryTextInput } from "@/app/src/ui/modules/sales/billing/entries/BillingEntryCellControls";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

const DebitColumnId = "debit";
const CreditColumnId = "credit";

export const BillingAccountingColumnIds = [
  "accountCode",
  "accountTitle",
  DebitColumnId,
  CreditColumnId,
  "partyCode",
  "partyName",
  "particulars",
  "vatType",
  "atcCode",
  "responsibilityCenter",
  "refNo",
] as const;

export const BillingAccountingDefaultVisibleColumnIds = [
  "accountTitle",
  DebitColumnId,
  CreditColumnId,
  "particulars",
] as const satisfies readonly BillingAccountingColumnId[];

export const BillingAccountingProtectedColumnIds = new Set<BillingAccountingColumnId>(["accountTitle", DebitColumnId, CreditColumnId]);

const BillingAccountingColumnLabels: Record<BillingAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  atcCode: "EWT Code",
  [CreditColumnId]: "Credit",
  [DebitColumnId]: "Debit",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  refNo: "Reference No",
  responsibilityCenter: "Responsibility Center",
  vatType: "VAT Type",
};

const BillingAccountingColumnWidths: Record<BillingAccountingColumnId, number> = {
  accountCode: 160,
  accountTitle: 260,
  atcCode: 140,
  [CreditColumnId]: 160,
  [DebitColumnId]: 160,
  partyCode: 150,
  partyName: 220,
  particulars: 320,
  refNo: 160,
  responsibilityCenter: 220,
  vatType: 150,
};

type BillingAccountingEntryUpdater = (rowId: string, updates: Partial<Omit<BillingAccountingEntry, "id">>) => void;

export function createBillingAccountingEntryColumns(
  partyOptions: AppAdvancedDropdownOption[],
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
  isReadonly: boolean,
  onUpdateEntry: BillingAccountingEntryUpdater,
): ModuleDataEntryColumn<BillingAccountingEntry>[] {
  return BillingAccountingColumnIds.map((columnId) => ({
    header: BillingAccountingColumnLabels[columnId],
    id: columnId,
    width: BillingAccountingColumnWidths[columnId],
    widthClassName: getColumnWidthClassName(columnId),
    widthMode: "fixed",
    renderCell: (entry, _index, context) =>
      renderAccountingCell(entry, columnId, context, partyOptions, responsibilityCenterOptions, isReadonly, onUpdateEntry),
  }));
}

function renderAccountingCell(
  entry: BillingAccountingEntry,
  columnId: BillingAccountingColumnId,
  context: { fieldId: string; fieldName: string },
  partyOptions: AppAdvancedDropdownOption[],
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
  isReadonly: boolean,
  onUpdateEntry: BillingAccountingEntryUpdater,
) {
  if (columnId === DebitColumnId || columnId === CreditColumnId) {
    const oppositeColumnId = columnId === DebitColumnId ? CreditColumnId : DebitColumnId;

    return (
      <BillingEntryAmountInput
        id={context.fieldId}
        name={context.fieldName}
        value={entry[columnId] > 0 ? String(entry[columnId]) : ""}
        readOnly={isReadonly}
        onValueChange={(value) => {
          const amount = parseMoneyNumberInput(value);

          onUpdateEntry(entry.id, {
            [columnId]: amount,
            [oppositeColumnId]: amount > 0 ? 0 : entry[oppositeColumnId],
          });
        }}
      />
    );
  }

  if (columnId === "partyName") {
    return (
      <AppAdvancedDropdown
        id={context.fieldId}
        name={context.fieldName}
        className={EntryDropdownClassName}
        value={entry.partyName}
        readOnly={isReadonly}
        options={partyOptions}
        placeholder=""
        searchPlaceholder="Search party"
        showSelectedDetails
        onChange={(value) => {
          const partyName = String(value);
          const selectedParty = partyOptions.find((option) => option.value === partyName);

          onUpdateEntry(entry.id, {
            partyCode: selectedParty?.label ?? "",
            partyName,
          });
        }}
      />
    );
  }

  if (columnId === "vatType" || columnId === "atcCode" || columnId === "responsibilityCenter") {
    const options =
      columnId === "vatType" ? BillingVatTypeOptions : columnId === "atcCode" ? BillingTaxTypeOptions : responsibilityCenterOptions;

    return (
      <AppAdvancedDropdown
        id={context.fieldId}
        name={context.fieldName}
        className={EntryDropdownClassName}
        value={String(entry[columnId])}
        readOnly={isReadonly}
        options={options}
        placeholder=""
        onChange={(value) => onUpdateEntry(entry.id, { [columnId]: String(value) })}
      />
    );
  }

  return (
    <BillingEntryTextInput
      id={context.fieldId}
      name={context.fieldName}
      value={String(entry[columnId])}
      readOnly={isReadonly || columnId === "partyCode"}
      onChange={(value) => onUpdateEntry(entry.id, { [columnId]: value })}
    />
  );
}

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function getColumnWidthClassName(columnId: BillingAccountingColumnId) {
  switch (columnId) {
    case "accountCode":
    case CreditColumnId:
    case DebitColumnId:
    case "refNo":
      return "w-[10rem]";
    case "accountTitle":
      return "w-[16.25rem]";
    case "particulars":
      return "w-[20rem]";
    case "partyName":
    case "responsibilityCenter":
      return "w-[13.75rem]";
    case "partyCode":
    case "vatType":
      return "w-[9.5rem]";
    case "atcCode":
      return "w-[8.75rem]";
    default:
      return "w-[10rem]";
  }
}
