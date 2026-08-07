import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type {
  AccountingEntry,
  AccountingEntryColumnId,
  AccountingEntryUpdate,
} from "@/app/src/types/shared/accounting/AccountingEntryTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import type { ModuleDataEntryColumn } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { MoneyNumberField, parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { getAccountingEntryAmountUpdates } from "@/app/src/ui/shared/accounting-entry/AccountingEntryRowUtils";

export const AccountingEntryColumnIds: readonly AccountingEntryColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
  "vatType",
  "atcCode",
  "responsibilityCenter",
  "refNo",
];

export const AccountingEntryDefaultVisibleColumnIds = [
  "accountTitle",
  "debit",
  "credit",
  "particulars",
] as const satisfies readonly AccountingEntryColumnId[];

export const AccountingEntryProtectedColumnIds = new Set<AccountingEntryColumnId>(["accountTitle", "debit", "credit"]);

export type AccountingEntryColumnOptions = Partial<
  Record<"partyName" | "vatType" | "atcCode" | "responsibilityCenter", AppAdvancedDropdownOption[]>
>;

export type AccountingEntryColumnConfig<TRow extends AccountingEntry> = {
  columnIds?: readonly AccountingEntryColumnId[];
  options?: AccountingEntryColumnOptions;
  readOnlyFields?: readonly AccountingEntryColumnId[];
  onFieldChange?: (row: TRow, columnId: AccountingEntryColumnId, value: string) => Partial<Omit<TRow, "id">> | undefined;
  onUpdateEntry: AccountingEntryUpdate<TRow>;
  isReadonly: boolean;
};

export function createAccountingEntryColumns<TRow extends AccountingEntry>({
  columnIds = AccountingEntryColumnIds,
  isReadonly,
  onUpdateEntry,
  options = {},
  onFieldChange,
  readOnlyFields = [],
}: AccountingEntryColumnConfig<TRow>): ModuleDataEntryColumn<TRow>[] {
  const readOnlySet = new Set(readOnlyFields);

  return columnIds.map((columnId) => ({
    header: AccountingEntryColumnLabels[columnId],
    id: columnId,
    width: AccountingEntryColumnWidths[columnId],
    widthClassName: getColumnWidthClassName(columnId),
    widthMode: "fixed",
    renderCell: (row, _index, context) =>
      renderAccountingCell(
        row,
        columnId,
        context,
        isAccountingEntryColumnReadOnly(columnId, isReadonly, readOnlySet),
        onUpdateEntry,
        onFieldChange,
        options,
      ),
  }));
}

export function isAccountingEntryColumnReadOnly(
  columnId: AccountingEntryColumnId,
  isReadonly: boolean,
  readOnlyFields: ReadonlySet<AccountingEntryColumnId> | readonly AccountingEntryColumnId[] = [],
) {
  if (isReadonly) return true;
  if (Array.isArray(readOnlyFields)) return readOnlyFields.includes(columnId);
  return (readOnlyFields as ReadonlySet<AccountingEntryColumnId>).has(columnId);
}

function renderAccountingCell<TRow extends AccountingEntry>(
  row: TRow,
  columnId: AccountingEntryColumnId,
  context: { fieldId: string; fieldName: string },
  isReadonly: boolean,
  onUpdateEntry: AccountingEntryUpdate<TRow>,
  onFieldChange: ((row: TRow, columnId: AccountingEntryColumnId, value: string) => Partial<Omit<TRow, "id">> | undefined) | undefined,
  options: AccountingEntryColumnOptions,
) {
  if (columnId === "debit" || columnId === "credit") {
    return (
      <MoneyNumberField
        id={context.fieldId}
        name={context.fieldName}
        value={parseMoneyNumberInput(String(row[columnId])) > 0 ? String(row[columnId]) : ""}
        readOnly={isReadonly}
        className="h-10 w-full border-0 bg-transparent px-3 text-right text-sm font-medium tabular-nums outline-none focus:bg-white/5"
        onValueChange={(value) => {
          const amount = parseMoneyNumberInput(value);
          onUpdateEntry(row.id, getAccountingEntryAmountUpdates(row, columnId, amount));
        }}
      />
    );
  }

  const dropdownOptions = options[columnId as keyof AccountingEntryColumnOptions];
  if (dropdownOptions) {
    return (
      <AppAdvancedDropdown
        id={context.fieldId}
        name={context.fieldName}
        className="min-w-40"
        value={String(row[columnId])}
        readOnly={isReadonly}
        options={dropdownOptions}
        placeholder=""
        onChange={(value) => {
          const stringValue = String(value);
          onUpdateEntry(
            row.id,
            onFieldChange?.(row, columnId, stringValue) ??
              ({
                [columnId]: stringValue,
              } as Partial<Omit<TRow, "id">>),
          );
        }}
      />
    );
  }

  return (
    <input
      id={context.fieldId}
      name={context.fieldName}
      type="text"
      value={String(row[columnId] ?? "")}
      readOnly={isReadonly}
      className={joinClasses("h-10 w-full border-0 bg-transparent px-3 text-sm font-medium outline-none focus:bg-white/5", "")}
      onChange={(event) => {
        const value = event.target.value;
        onUpdateEntry(
          row.id,
          onFieldChange?.(row, columnId, value) ??
            ({
              [columnId]: value,
            } as Partial<Omit<TRow, "id">>),
        );
      }}
    />
  );
}

const AccountingEntryColumnLabels: Record<AccountingEntryColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  atcCode: "EWT Code",
  credit: "Credit",
  debit: "Debit",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  refNo: "Reference No",
  responsibilityCenter: "Responsibility Center",
  vatType: "VAT Type",
};

const AccountingEntryColumnWidths: Record<AccountingEntryColumnId, number> = {
  accountCode: 160,
  accountTitle: 260,
  atcCode: 140,
  credit: 160,
  debit: 160,
  partyCode: 150,
  partyName: 220,
  particulars: 320,
  refNo: 160,
  responsibilityCenter: 220,
  vatType: 150,
};

function getColumnWidthClassName(columnId: AccountingEntryColumnId) {
  if (columnId === "accountTitle") return "min-w-[260px]";
  if (columnId === "particulars") return "min-w-[320px]";
  return "min-w-[150px]";
}
