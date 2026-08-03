import { useCallback, useMemo, type ReactNode } from "react";
import { createBlankSalesInvoiceAccountEntry } from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceFactories";
import type { SalesInvoiceAccountEntry } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { createSalesInvoiceAccountColumns } from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceEntryColumns";
import {
  calculateSalesInvoiceAccountEntryTotals,
  createSalesInvoiceColumnOptions,
  formatSalesInvoiceEntryAmount,
  shouldClearSalesInvoiceAccountEntry,
} from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceEntryRowUtils";

type SalesInvoiceAccountEntryTableProps = {
  isReadonly: boolean;
  rows: SalesInvoiceAccountEntry[];
  title: ReactNode;
  onRowsChange: (rows: SalesInvoiceAccountEntry[]) => void;
};

export function SalesInvoiceAccountEntryTable({
  isReadonly,
  onRowsChange,
  rows,
  title,
}: SalesInvoiceAccountEntryTableProps) {
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<SalesInvoiceAccountEntry>) => {
      onRowsChange(
        rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
      );
    },
    [onRowsChange, rows],
  );
  const totals = useMemo(
    () => calculateSalesInvoiceAccountEntryTotals(rows),
    [rows],
  );
  const columns = useMemo(
    () => createSalesInvoiceAccountColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const columnOptions = useMemo(
    () => createSalesInvoiceColumnOptions(columns),
    [columns],
  );

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="account"
      exportOptions={EntryExportOptions}
      footerDetails={
        <span
          className={joinClasses(
            "text-sm font-semibold",
            totals.debit === totals.credit ? "text-emerald-700" : "text-red-600",
          )}
        >
          Difference: {formatSalesInvoiceEntryAmount(Math.abs(totals.debit - totals.credit))}
        </span>
      }
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{
        credit: formatSalesInvoiceEntryAmount(totals.credit),
        debit: formatSalesInvoiceEntryAmount(totals.debit),
      }}
      summaryRowHeader="Totals"
      title={title}
      onAddRows={(count) =>
        onRowsChange([
          ...rows,
          ...Array.from({ length: count }, () =>
            createBlankSalesInvoiceAccountEntry(),
          ),
        ])
      }
      onAutoColumnWidth={() => undefined}
      onClearRows={(action) => clearRows(action, rows, onRowsChange)}
      onDuplicateRow={(rowId) => duplicateRow(rowId, rows, onRowsChange)}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) =>
        insertRow(rowId, position, rows, onRowsChange)
      }
      onMoveRow={(fromRowId, toRowId) =>
        moveRow(fromRowId, toRowId, rows, onRowsChange)
      }
      onRemoveRow={(rowId) => removeRow(rowId, rows, onRowsChange)}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function clearRows(
  action: ModuleDataEntryClearAction,
  rows: SalesInvoiceAccountEntry[],
  onRowsChange: (rows: SalesInvoiceAccountEntry[]) => void,
) {
  if (action === "all") {
    onRowsChange([createBlankSalesInvoiceAccountEntry()]);
    return;
  }

  const nextRows = rows.filter(
    (row) => !shouldClearSalesInvoiceAccountEntry(row, action),
  );
  onRowsChange(
    nextRows.length > 0 ? nextRows : [createBlankSalesInvoiceAccountEntry()],
  );
}

function duplicateRow(
  rowId: string,
  rows: SalesInvoiceAccountEntry[],
  onRowsChange: (rows: SalesInvoiceAccountEntry[]) => void,
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);
  const row = rows[rowIndex];

  if (!row) {
    return;
  }

  const nextRows = [...rows];
  nextRows.splice(rowIndex + 1, 0, {
    ...row,
    id: createBlankSalesInvoiceAccountEntry().id,
  });
  onRowsChange(nextRows);
}

function insertRow(
  rowId: string,
  position: "above" | "below",
  rows: SalesInvoiceAccountEntry[],
  onRowsChange: (rows: SalesInvoiceAccountEntry[]) => void,
) {
  const rowIndex = rows.findIndex((row) => row.id === rowId);

  if (rowIndex < 0) {
    return;
  }

  const nextRows = [...rows];
  nextRows.splice(
    position === "above" ? rowIndex : rowIndex + 1,
    0,
    createBlankSalesInvoiceAccountEntry(),
  );
  onRowsChange(nextRows);
}

function moveRow(
  fromRowId: string,
  toRowId: string,
  rows: SalesInvoiceAccountEntry[],
  onRowsChange: (rows: SalesInvoiceAccountEntry[]) => void,
) {
  const fromIndex = rows.findIndex((row) => row.id === fromRowId);
  const toIndex = rows.findIndex((row) => row.id === toRowId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return;
  }

  const nextRows = [...rows];
  const [movedRow] = nextRows.splice(fromIndex, 1);

  if (!movedRow) {
    return;
  }

  nextRows.splice(toIndex, 0, movedRow);
  onRowsChange(nextRows);
}

function removeRow(
  rowId: string,
  rows: SalesInvoiceAccountEntry[],
  onRowsChange: (rows: SalesInvoiceAccountEntry[]) => void,
) {
  const nextRows = rows.filter((row) => row.id !== rowId);
  onRowsChange(
    nextRows.length > 0 ? nextRows : [createBlankSalesInvoiceAccountEntry()],
  );
}

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
