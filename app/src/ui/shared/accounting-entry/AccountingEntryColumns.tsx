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
  "responsibilityCenterCode",
  "checkNo",
  "checkStatus",
  "checkDate",
];

export const AccountingEntryDefaultVisibleColumnIds = [
  "accountTitle",
  "debit",
  "credit",
  "particulars",
] as const satisfies readonly AccountingEntryColumnId[];

export const AccountingEntryProtectedColumnIds = new Set<AccountingEntryColumnId>([
  "accountTitle",
  "accountName",
  "debit",
  "credit",
]);

export type AccountingEntryColumnOptions = Partial<
  Record<
    | "partyName"
    | "vatType"
    | "atcCode"
    | "responsibilityCenter"
    | "accountTitle"
    | "accountName"
    | "accountCode",
    AppAdvancedDropdownOption[]
  >
>;

export type AccountingEntryColumnConfig<TRow extends AccountingEntry> = {
  columnIds?: readonly AccountingEntryColumnId[];
  columnLabels?: Partial<Record<AccountingEntryColumnId, string>>;
  customColumns?: ModuleDataEntryColumn<TRow>[];
  highlightedAmountRowIds?: ReadonlySet<string>;
  options?: AccountingEntryColumnOptions;
  readOnlyFields?: readonly AccountingEntryColumnId[];
  onFieldChange?: (row: TRow, columnId: AccountingEntryColumnId, value: string) => Partial<Omit<TRow, "id">> | undefined;
  onUpdateEntry: AccountingEntryUpdate<TRow>;
  isReadonly: boolean;
};

export function createAccountingEntryColumns<TRow extends AccountingEntry>({
  columnIds = AccountingEntryColumnIds,
  columnLabels = {},
  customColumns = [],
  highlightedAmountRowIds,
  isReadonly,
  onUpdateEntry,
  options = {},
  onFieldChange,
  readOnlyFields = [],
}: AccountingEntryColumnConfig<TRow>): ModuleDataEntryColumn<TRow>[] {
  const readOnlySet = new Set(readOnlyFields);

  const baseColumns: ModuleDataEntryColumn<TRow>[] = columnIds.map((columnId) => ({
    header: columnLabels[columnId] ?? AccountingEntryColumnLabels[columnId] ?? columnId,
    id: columnId,
    width: AccountingEntryColumnWidths[columnId] ?? 160,
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
        highlightedAmountRowIds,
      ),
  }));

  return [...baseColumns, ...customColumns];
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
  highlightedAmountRowIds?: ReadonlySet<string>,
) {
  if (columnId === "debit" || columnId === "credit") {
    const isHighlighted = highlightedAmountRowIds?.has(row.id) ?? false;
    const amountVal = row[columnId];

    return (
      <MoneyNumberField
        id={context.fieldId}
        name={context.fieldName}
        value={parseMoneyNumberInput(String(amountVal ?? "")) > 0 ? String(amountVal) : ""}
        readOnly={isReadonly}
        className={joinClasses(
          "h-10 w-full border-0 bg-transparent px-3 text-right text-sm font-medium tabular-nums outline-none focus:bg-white/5",
          isHighlighted
            ? "bg-coralpink/10 text-coralpink ring-2 ring-inset ring-coralpink/50"
            : "",
        )}
        onValueChange={(value) => {
          const amount = parseMoneyNumberInput(value);
          onUpdateEntry(row.id, getAccountingEntryAmountUpdates(row, columnId, amount));
        }}
      />
    );
  }

  const dropdownOptions = options[columnId as keyof AccountingEntryColumnOptions];
  if (dropdownOptions) {
    const value = getRowValue(row, columnId);
    return (
      <AppAdvancedDropdown
        id={context.fieldId}
        name={context.fieldName}
        className="min-w-40"
        value={value}
        readOnly={isReadonly}
        options={dropdownOptions}
        placeholder=""
        onChange={(val) => {
          const stringValue = String(val);
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
      value={getRowValue(row, columnId)}
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

function getRowValue<TRow extends AccountingEntry>(row: TRow, columnId: AccountingEntryColumnId): string {
  if (columnId === "accountTitle") return String(row.accountTitle || row.accountName || "");
  if (columnId === "accountName") return String(row.accountName || row.accountTitle || "");
  if (columnId === "particulars") return String(row.particulars || row.remarks || "");
  if (columnId === "remarks") return String(row.remarks || row.particulars || "");
  if (columnId === "refNo") return String(row.refNo || row.refId || "");
  if (columnId === "refId") return String(row.refId || row.refNo || "");
  return String(row[columnId as keyof TRow] ?? "");
}

const AccountingEntryColumnLabels: Record<AccountingEntryColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  accountName: "Account Name",
  atcCode: "EWT Code",
  credit: "Credit",
  debit: "Debit",
  partyCode: "Party Code",
  partyName: "Party Name",
  particulars: "Particulars",
  remarks: "Remarks",
  refNo: "Reference No",
  refId: "Reference No",
  responsibilityCenter: "Responsibility Center",
  responsibilityCenterCode: "Responsibility Center Code",
  vatType: "VAT Type",
  checkNo: "Check No.",
  checkStatus: "Check Status",
  checkDate: "Check Date",
};

const AccountingEntryColumnWidths: Record<AccountingEntryColumnId, number> = {
  accountCode: 160,
  accountTitle: 260,
  accountName: 260,
  atcCode: 140,
  credit: 160,
  debit: 160,
  partyCode: 150,
  partyName: 220,
  particulars: 320,
  remarks: 320,
  refNo: 160,
  refId: 160,
  responsibilityCenter: 220,
  responsibilityCenterCode: 240,
  vatType: 150,
  checkNo: 150,
  checkStatus: 170,
  checkDate: 155,
};

function getColumnWidthClassName(columnId: AccountingEntryColumnId) {
  if (columnId === "accountTitle" || columnId === "accountName") return "min-w-[260px]";
  if (columnId === "particulars" || columnId === "remarks") return "min-w-[320px]";
  return "min-w-[150px]";
}
