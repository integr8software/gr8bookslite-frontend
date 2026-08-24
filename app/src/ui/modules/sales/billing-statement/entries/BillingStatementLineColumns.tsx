import {
  BillingStatementBooleanOptions,
  BillingStatementDescriptionOptions,
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

type BillingStatementLineColumnKind = "amount" | "boolean" | "select" | "service" | "text";

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

  if (column.kind === "service" || column.id === "description") {
    return (
      <AppAdvancedDropdown
        id={fieldId}
        name={fieldName}
        value={value}
        readOnly={isReadonly}
        options={BillingStatementDescriptionOptions.map((option) => ({
          name: option,
          value: option === "--Select Description--" ? "" : option,
        }))}
        placeholder="--Select Description--"
        searchPlaceholder="Search description"
        className={EntryDropdownClassName}
        onChange={(nextValue) => onUpdateEntry(row.id, { [column.id]: String(nextValue) })}
      />
    );
  }

  if (column.kind === "boolean" || column.kind === "select") {
    const options =
      column.kind === "boolean"
        ? BillingStatementBooleanOptions
        : ["VAT (12%)", "Zero-rated", "VAT Exempt"];
    const isVatInclusive = column.id === "vatInclusive";
    const isVatInclusiveDisabled =
      isVatInclusive && String(row.vatable).toLowerCase() !== "true";

    return (
      <AppAdvancedDropdown
        id={fieldId}
        name={fieldName}
        value={value}
        readOnly={isReadonly || isVatInclusiveDisabled}
        options={options.map((option) => ({ name: option || " ", value: option }))}
        placeholder=""
        className={EntryDropdownClassName}
        onChange={(nextValue) => {
          const stringValue = String(nextValue);

          if (column.id === "vatable") {
            onUpdateEntry(row.id, {
              vatable: stringValue,
              ...(stringValue.toLowerCase() !== "true"
                ? { vatInclusive: "False" }
                : {}),
            });
            return;
          }

          onUpdateEntry(row.id, { [column.id]: stringValue });
        }}
      />
    );
  }

  if (column.kind === "amount") {
    const isCalculatedAmount =
      column.id === "discountAmount" ||
      column.id === "grossAmount" ||
      column.id === "grossAfterDiscount" ||
      column.id === "netAmount" ||
      column.id === "netOfVatAmount" ||
      column.id === "vatAmount";

    return (
      <MoneyNumberField
        id={fieldId}
        name={fieldName}
        value={formatMoneyNumberInput(value)}
        readOnly={isReadonly || isCalculatedAmount}
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
  column("Professional Service Type", "description", "service", 260, "w-[16.25rem]"),
  column("Amount", "amount", "amount", 150, "w-[9.5rem]"),
  column("QTY", "quantity", "amount", 130, "w-[8rem]"),
  column("Gross", "netAmount", "amount", 150, "w-[9.5rem]"),
  column("Discount Rate", "discountPercent", "amount", 160, "w-[10rem]"),
  column("Discount Amount", "discountAmount", "amount", 170, "w-[10.5rem]"),
  column("Gross After Discount", "grossAfterDiscount", "amount", 190, "w-[11.75rem]"),
  column("VAT Amount", "vatAmount", "amount", 150, "w-[9.5rem]"),
  column("VATable", "vatable", "boolean", 130, "w-[8rem]"),
  column("VATInc", "vatInclusive", "boolean", 130, "w-[8rem]"),
  column("Net of VAT Amount", "netOfVatAmount", "amount", 190, "w-[11.75rem]"),
  column("Net Amount", "grossAmount", "amount", 150, "w-[9.5rem]"),
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
