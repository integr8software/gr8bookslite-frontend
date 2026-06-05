import type { ClipboardEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  BeginningBalanceUploaderColumns,
  BeginningBalanceUploaderPageCopy,
  BeginningBalanceUploaderRowBatchOptions,
} from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import { formatBeginningBalanceAmount } from "@/app/src/data/modules/beginning-balance-uploader/BeginningBalanceUploaderData";
import type {
  BeginningBalanceUploaderField,
  BeginningBalanceUploaderRow,
  BeginningBalanceUploaderTotals,
} from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type BeginningBalanceUploaderEntriesTableProps = {
  rowBatchSize: number;
  rows: BeginningBalanceUploaderRow[];
  totals: BeginningBalanceUploaderTotals;
  onAddRows: () => void;
  onDeleteRow: (rowId: number) => void;
  onPasteRows: (
    event: ClipboardEvent<HTMLInputElement>,
    startRowIndex: number,
    startField: BeginningBalanceUploaderField,
  ) => void;
  onRowBatchSizeChange: (value: number) => void;
  onUpdateRow: (
    rowId: number,
    field: BeginningBalanceUploaderField,
    value: string,
  ) => void;
};

export function BeginningBalanceUploaderEntriesTable({
  rowBatchSize,
  rows,
  totals,
  onAddRows,
  onDeleteRow,
  onPasteRows,
  onRowBatchSizeChange,
  onUpdateRow,
}: BeginningBalanceUploaderEntriesTableProps) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-darknavy/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-darknavy">
            {BeginningBalanceUploaderPageCopy.entriesTitle}
          </h2>
          <p className="mt-1 text-sm text-darknavy/55">
            {BeginningBalanceUploaderPageCopy.entriesDescription}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[72rem] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-darknavy/5 text-xs font-semibold uppercase text-darknavy/55">
              <th className="w-12 border-b border-r border-darknavy/10 px-3 py-3 text-center">
                #
              </th>
              {BeginningBalanceUploaderColumns.map((column) => (
                <th
                  key={column.field}
                  className="border-b border-r border-darknavy/10 px-3 py-3"
                >
                  {column.label}
                </th>
              ))}
              <th className="w-14 border-b border-darknavy/10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id} className="text-darknavy">
                <td className="border-b border-r border-darknavy/10 bg-darknavy/5 px-3 py-2 text-center text-xs font-semibold text-darknavy/45">
                  {rowIndex + 1}
                </td>
                {BeginningBalanceUploaderColumns.map((column) => (
                  <GridCell
                    key={column.field}
                    align={column.align}
                    inputMode={column.inputMode}
                    placeholder={column.placeholder}
                    type={column.type}
                    value={row[column.field]}
                    onChange={(value) =>
                      onUpdateRow(row.id, column.field, value)
                    }
                    onPaste={(event) =>
                      onPasteRows(event, rowIndex, column.field)
                    }
                  />
                ))}
                <td className="border-b border-darknavy/10 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => onDeleteRow(row.id)}
                    aria-label={`Delete row ${rowIndex + 1}`}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/45 transition hover:bg-coralpink/10 hover:text-coralpink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <BeginningBalanceEntriesFooter totals={totals} />
        </table>

        <div className="flex justify-end gap-2 p-4">
          <select
            value={rowBatchSize}
            onChange={(event) =>
              onRowBatchSizeChange(Number(event.target.value))
            }
            className="block h-10 rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy shadow-sm outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/25"
            aria-label="Rows to add"
          >
            {BeginningBalanceUploaderRowBatchOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddRows}
            className={moduleHeaderActionClassNames.secondary}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Add Row</span>
          </button>
        </div>
      </div>
    </section>
  );
}

type BeginningBalanceEntriesFooterProps = {
  totals: BeginningBalanceUploaderTotals;
};

function BeginningBalanceEntriesFooter({
  totals,
}: BeginningBalanceEntriesFooterProps) {
  return (
    <tfoot>
      <tr className="bg-darknavy/5 text-sm font-semibold text-darknavy">
        <td className="border-t border-r border-darknavy/10 px-3 py-2 text-center text-xs uppercase text-darknavy/45">
          Total
        </td>
        {BeginningBalanceUploaderColumns.map((column) => (
          <td
            key={column.field}
            className={joinClasses(
              "border-t border-r border-darknavy/10 px-3 py-2",
              column.align === "right" && "text-right tabular-nums",
              column.field === "debit" && "font-semibold",
              column.field === "credit" && "font-semibold",
              column.field === "refNo" &&
                (totals.variance === 0 ? "text-skyblue" : "text-coralpink"),
            )}
          >
            {getFooterValue(column.field, totals)}
          </td>
        ))}
        <td className="border-t border-darknavy/10" />
      </tr>
    </tfoot>
  );
}

type GridCellProps = {
  align?: "left" | "right";
  inputMode?: "decimal";
  onChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "date" | "text";
  value: string;
};

function GridCell({
  align = "left",
  inputMode,
  onChange,
  onPaste,
  placeholder,
  type = "text",
  value,
}: GridCellProps) {
  return (
    <td className="border-b border-r border-darknavy/10 p-0">
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onPaste={onPaste}
        className={joinClasses(
          "h-11 w-full border-0 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/25 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35",
          align === "right" && "text-right tabular-nums",
        )}
      />
    </td>
  );
}

function getFooterValue(
  field: BeginningBalanceUploaderField,
  totals: BeginningBalanceUploaderTotals,
) {
  switch (field) {
    case "debit":
      return formatBeginningBalanceAmount(totals.debit);
    case "credit":
      return formatBeginningBalanceAmount(totals.credit);
    case "refNo":
      return formatBeginningBalanceAmount(totals.variance);
    default:
      return "";
  }
}
