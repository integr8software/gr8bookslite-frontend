import {
  SalesQuotationBooleanOptions,
  SalesQuotationUomOptions,
} from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import {
  formatSalesQuotationCurrency,
  getSalesQuotationItemAmount,
  getSalesQuotationItemNetAmount,
  getSalesQuotationItemVatAmount,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import type { SalesQuotationItem } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const AmountColumnKind = "amount";
const DateColumnKind = "date";
const SelectColumnKind = "select";
const TextColumnKind = "text";

type SalesQuotationEntryColumnKind = typeof AmountColumnKind | typeof DateColumnKind | typeof SelectColumnKind | typeof TextColumnKind;

type SalesQuotationEntryColumnConfig = {
  header: string;
  id: keyof SalesQuotationItem | "grossAmount" | "netAmount";
  kind: SalesQuotationEntryColumnKind;
  options?: readonly string[];
  width: number;
  widthClassName: string;
};

type SalesQuotationEntryUpdater = (rowId: string, updates: Partial<SalesQuotationItem>) => void;

export function createSalesQuotationLineColumns(
  isReadonly: boolean,
  onUpdateEntry: SalesQuotationEntryUpdater,
): ModuleDataEntryColumn<SalesQuotationItem>[] {
  return SalesQuotationEntryColumnConfigs.map((column) => ({
    header: column.header,
    id: column.id,
    width: column.width,
    widthClassName: column.widthClassName,
    renderCell: (row, _index, context) => (
      <SalesQuotationEntryCell
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

function SalesQuotationEntryCell({
  column,
  fieldId,
  fieldName,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: SalesQuotationEntryColumnConfig;
  fieldId: string;
  fieldName: string;
  isReadonly: boolean;
  onUpdateEntry: SalesQuotationEntryUpdater;
  row: SalesQuotationItem;
}) {
  if (column.id === "grossAmount") {
    return (
      <div className={entryCellDisplayClassName("text-right tabular-nums")}>
        {formatSalesQuotationCurrency(getSalesQuotationItemAmount(row))}
      </div>
    );
  }

  if (column.id === "netAmount") {
    return (
      <div className={entryCellDisplayClassName("justify-end tabular-nums")}>
        {formatSalesQuotationCurrency(getSalesQuotationItemNetAmount(row))}
      </div>
    );
  }

  if (column.id === "vatAmount") {
    return (
      <div className={entryCellDisplayClassName("justify-end tabular-nums")}>
        {formatSalesQuotationCurrency(getSalesQuotationItemVatAmount(row))}
      </div>
    );
  }

  const value = String(row[column.id] ?? "");

  if (column.kind === SelectColumnKind) {
    return (
      <select
        id={fieldId}
        name={fieldName}
        value={value}
        disabled={isReadonly}
        onChange={(event) => onUpdateEntry(row.id, { [column.id]: event.target.value })}
        className={entryCellControlClassName()}
      >
        {(column.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (column.kind === AmountColumnKind) {
    return (
      <MoneyNumberField
        id={fieldId}
        name={fieldName}
        value={value}
        readOnly={isReadonly}
        onValueChange={(nextValue) => onUpdateEntry(row.id, { [column.id]: Number(nextValue) })}
        className={entryCellControlClassName("text-right tabular-nums")}
      />
    );
  }

  return (
    <input
      id={fieldId}
      name={fieldName}
      type={column.kind === DateColumnKind ? "date" : "text"}
      value={value}
      readOnly={isReadonly}
      onChange={(event) => onUpdateEntry(row.id, { [column.id]: event.target.value })}
      className={entryCellControlClassName()}
    />
  );
}

function entryCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

function entryCellDisplayClassName(extraClassName?: string) {
  return joinClasses("flex h-10 w-full items-center px-3 text-sm font-semibold text-darknavy", extraClassName);
}

const SalesQuotationEntryColumnConfigs = [
  column("Item Code", "itemCode", TextColumnKind, 130, "w-[8rem]"),
  column("Barcode", "barcode", TextColumnKind, 130, "w-[8rem]"),
  column("Item Name", "itemName", TextColumnKind, 180, "w-[11.25rem]"),
  column("Item Category", "itemCategory", TextColumnKind, 180, "w-[11.25rem]"),
  column("UOM", "uom", SelectColumnKind, 130, "w-[8rem]", SalesQuotationUomOptions),
  column("Qty", "quantity", AmountColumnKind, 120, "w-[7.5rem]"),
  column("Item Price", "itemPrice", AmountColumnKind, 130, "w-[8rem]"),
  column("Gross Amount", "grossAmount", AmountColumnKind, 150, "w-[9.5rem]"),
  column("VAT Amount", "vatAmount", AmountColumnKind, 140, "w-[8.75rem]"),
  column("EWT", "ewtAmount", AmountColumnKind, 140, "w-[8.75rem]"),
  column("Discount", "discountAmount", AmountColumnKind, 150, "w-[9.5rem]"),
  column("Net Amount", "netAmount", AmountColumnKind, 150, "w-[9.5rem]"),
  column("VATable", "vatable", SelectColumnKind, 120, "w-[7.5rem]", SalesQuotationBooleanOptions),
  column("VAT Inc.", "vatInclusive", SelectColumnKind, 120, "w-[7.5rem]", SalesQuotationBooleanOptions),
  column("VAT Type", "vatType", TextColumnKind, 170, "w-[10.5rem]"),
  column("Res. Center", "responsibilityCenter", TextColumnKind, 190, "w-[12rem]"),
];

function column(
  header: string,
  id: keyof SalesQuotationItem | "grossAmount" | "netAmount",
  kind: SalesQuotationEntryColumnKind,
  width: number,
  widthClassName: string,
  options?: readonly string[],
): SalesQuotationEntryColumnConfig {
  return { header, id, kind, options, width, widthClassName };
}
