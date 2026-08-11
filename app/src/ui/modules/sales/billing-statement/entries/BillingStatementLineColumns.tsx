import {
  BillingStatementBooleanOptions,
  BillingStatementDiscountOptions,
  BillingStatementTypeOptions,
} from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import type { BillingStatementItem } from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
  formatMoneyNumberInput,
  MoneyNumberField,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type BillingStatementLineColumnKind = "amount" | "boolean" | "discount" | "select" | "text";

type BillingStatementLineColumnConfig = {
  header: string;
  id: keyof BillingStatementItem;
  kind: BillingStatementLineColumnKind;
  width: number;
  widthClassName: string;
};

type BillingStatementLineUpdater = (
  rowId: string,
  updates: Partial<BillingStatementItem>,
) => void;

export function createBillingStatementLineColumns(
  isReadonly: boolean,
  onUpdateEntry: BillingStatementLineUpdater,
): ModuleDataEntryColumn<BillingStatementItem>[] {
  return BillingStatementLineColumnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row, _index, context) => (
      <BillingStatementLineCell
        column={column}
        fieldId={context.fieldId}
        fieldName={context.fieldName}
        isReadonly={isReadonly}
        row={row}
        onUpdateEntry={onUpdateEntry}
      />
    ),
  }));
}

function BillingStatementLineCell({
  column,
  fieldId,
  fieldName,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: BillingStatementLineColumnConfig;
  fieldId: string;
  fieldName: string;
  isReadonly: boolean;
  onUpdateEntry: BillingStatementLineUpdater;
  row: BillingStatementItem;
}) {
  const value = String(row[column.id] ?? "");

  if (column.kind === "boolean" || column.kind === "discount" || column.kind === "select") {
    const options =
      column.kind === "boolean"
        ? BillingStatementBooleanOptions
        : column.kind === "discount"
          ? BillingStatementDiscountOptions
          : BillingStatementTypeOptions;

    return (
      <AppAdvancedDropdown
        id={fieldId}
        name={fieldName}
        value={value}
        readOnly={isReadonly}
        options={options.map((option) => ({ name: option || " ", value: option }))}
        placeholder=""
        className={EntryDropdownClassName}
        onChange={(nextValue) => onUpdateEntry(row.id, { [column.id]: String(nextValue) })}
      />
    );
  }

  if (column.kind === "amount") {
    return (
      <MoneyNumberField
        id={fieldId}
        name={fieldName}
        value={formatMoneyNumberInput(value)}
        readOnly={isReadonly}
        onValueChange={(nextValue) =>
          onUpdateEntry(row.id, { [column.id]: parseMoneyNumberInput(nextValue) })
        }
        className={entryCellControlClassName("text-right tabular-nums")}
      />
    );
  }

  return (
    <input
      id={fieldId}
      name={fieldName}
      type="text"
      value={value}
      readOnly={isReadonly}
      onChange={(event) => onUpdateEntry(row.id, { [column.id]: event.target.value })}
      className={entryCellControlClassName()}
    />
  );
}

const EntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function entryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

const BillingStatementLineColumnConfigs = [
  column("Description", "description", "text", 300, "w-[18.75rem]"),
  column("Particulars", "particulars", "text", 300, "w-[18.75rem]"),
  column("Amount", "amount", "amount", 150, "w-[9.5rem]"),
  column("Qty", "quantity", "amount", 130, "w-[8rem]"),
  column("Net Amount", "netAmount", "amount", 150, "w-[9.5rem]"),
  column("VAT Amount", "vatAmount", "amount", 150, "w-[9.5rem]"),
  column("WVAT Amount", "wvatAmount", "amount", 150, "w-[9.5rem]"),
  column("EWT Amount", "ewtAmount", "amount", 150, "w-[9.5rem]"),
  column("Discount %", "discountPercent", "discount", 140, "w-[8.75rem]"),
  column("Discount Amount", "discountAmount", "amount", 170, "w-[10.5rem]"),
  column("Gross Amount", "grossAmount", "amount", 170, "w-[10.5rem]"),
  column("VAT Type", "vatType", "select", 150, "w-[9.5rem]"),
  column("VATable", "vatable", "boolean", 130, "w-[8rem]"),
  column("VAT Inc.", "vatInclusive", "boolean", 130, "w-[8rem]"),
  column("With WVAT", "withWvat", "boolean", 140, "w-[8.75rem]"),
  column("WVAT Type", "wvatType", "discount", 140, "w-[8.75rem]"),
  column("With EWT", "withEwt", "boolean", 140, "w-[8.75rem]"),
  column("EWT Type", "ewtType", "discount", 140, "w-[8.75rem]"),
  column("Res. Center", "responsibilityCenter", "text", 220, "w-[13.75rem]"),
] satisfies BillingStatementLineColumnConfig[];

function column(
  header: string,
  id: keyof BillingStatementItem,
  kind: BillingStatementLineColumnKind,
  width: number,
  widthClassName: string,
): BillingStatementLineColumnConfig {
  return { header, id, kind, width, widthClassName };
}
