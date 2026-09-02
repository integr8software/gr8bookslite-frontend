import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  createOfficialReceiptAccountingRows,
  calculateOfficialReceiptTotals,
  formatOfficialReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import { useOfficialReceiptEntryColumns } from "@/app/src/hooks/modules/cash-receipt/official-receipt/useOfficialReceiptEntryColumns";
import { useOfficialReceiptEntryRows } from "@/app/src/hooks/modules/cash-receipt/official-receipt/useOfficialReceiptEntryRows";
import type {
  OfficialReceiptEntryView,
  OfficialReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import {
  OfficialReceiptAccountingEntryView,
  OfficialReceiptCollectionEntryView,
} from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptEntryColumns";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  createOfficialReceiptAccountingColumns,
  createOfficialReceiptCollectionColumns,
} from "@/app/src/ui/modules/cash-receipt/official-receipt/entries/OfficialReceiptEntryTableColumns";

type OfficialReceiptEntriesProps = {
  entryView: OfficialReceiptEntryView;
  isReadonly: boolean;
  rows: OfficialReceiptLineEntry[];
  onEntryViewChange: (view: OfficialReceiptEntryView) => void;
  onOpenCollectionTypeDialog: () => void;
  onRowsChange: (rows: OfficialReceiptLineEntry[]) => void;
};

export function OfficialReceiptEntries({
  entryView,
  isReadonly,
  onEntryViewChange,
  onOpenCollectionTypeDialog,
  onRowsChange,
  rows,
}: OfficialReceiptEntriesProps) {
  const rowHandlers = useOfficialReceiptEntryRows({ onRowsChange, rows });
  const totals = useMemo(() => calculateOfficialReceiptTotals(rows), [rows]);
  const variance = Math.abs(totals.debit - totals.credit);
  const accountingRows = useMemo(() => createOfficialReceiptAccountingRows(rows), [rows]);
  const {
    accountingColumnLabels,
    accountingColumnOrder,
    accountingColumnWidths,
    collectionColumnLabels,
    collectionColumnOrder,
    collectionColumnWidths,
    columnHandlers,
    columnOptions,
    visibleAccountingColumnIds,
    visibleCollectionColumnIds,
  } = useOfficialReceiptEntryColumns({ entryView, rows });

  const columns = useMemo<ModuleDataEntryColumn<OfficialReceiptLineEntry>[]>(
    () =>
      entryView === OfficialReceiptCollectionEntryView
        ? createOfficialReceiptCollectionColumns(
            isReadonly,
            rowHandlers.updateEntry,
            collectionColumnOrder,
            visibleCollectionColumnIds,
            collectionColumnLabels,
            collectionColumnWidths,
          )
        : createOfficialReceiptAccountingColumns(
            true,
            rowHandlers.updateEntry,
            accountingColumnOrder,
            visibleAccountingColumnIds,
            accountingColumnLabels,
            accountingColumnWidths,
          ),
    [
      accountingColumnLabels,
      accountingColumnOrder,
      accountingColumnWidths,
      collectionColumnLabels,
      collectionColumnOrder,
      collectionColumnWidths,
      entryView,
      isReadonly,
      rowHandlers.updateEntry,
      visibleAccountingColumnIds,
      visibleCollectionColumnIds,
    ],
  );

  return (
    <ModuleDataEntry
      columns={columns}
      columnResetLabel="Default"
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="entry"
      exportOptions={
        entryView === OfficialReceiptCollectionEntryView
          ? [
              { id: "csv", label: "CSV", onSelect: () => undefined },
              { id: "excel", label: "Excel", onSelect: () => undefined },
              { id: "pdf", label: "PDF", onSelect: () => undefined },
            ]
          : []
      }
      footerDetails={
        <span
          className={joinClasses(
            "text-sm font-semibold",
            variance < 0.001 ? "text-emerald-700" : "text-coralpink",
          )}
        >
          Variance: {formatOfficialReceiptAmount(variance)}
        </span>
      }
      isDraggable
      isReadonly={entryView === OfficialReceiptAccountingEntryView ? true : isReadonly}
      canConfigureColumnsWhenReadonly
      rows={entryView === OfficialReceiptAccountingEntryView ? accountingRows : rows}
      summaryCells={
        entryView === OfficialReceiptAccountingEntryView
          ? {
              credit: formatOfficialReceiptAmount(totals.credit),
              debit: formatOfficialReceiptAmount(totals.debit),
              particulars:
                variance < 0.001
                  ? "Balanced"
                  : `Difference: ${formatOfficialReceiptAmount(variance)}`,
            }
          : undefined
      }
      toolbarActions={
        entryView === OfficialReceiptCollectionEntryView
          ? [
              {
                id: "add-collection-type",
                icon: Plus,
                label: "Add Collection Type",
                onSelect: onOpenCollectionTypeDialog,
              },
            ]
          : []
      }
      title={
        <EntryViewTabs entryView={entryView} onEntryViewChange={onEntryViewChange} />
      }
      onAddRows={rowHandlers.addRows}
      onClearRows={rowHandlers.clearRows}
      onDuplicateRow={rowHandlers.duplicateRow}
      onImport={
        entryView === OfficialReceiptCollectionEntryView
          ? () => undefined
          : undefined
      }
      onInsertRow={rowHandlers.insertRow}
      onMoveRow={rowHandlers.moveRow}
      onRemoveRow={rowHandlers.removeRow}
      {...columnHandlers}
    />
  );
}

function EntryViewTabs({
  entryView,
  onEntryViewChange,
}: {
  entryView: OfficialReceiptEntryView;
  onEntryViewChange: (view: OfficialReceiptEntryView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Entry view"
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {([
        [OfficialReceiptCollectionEntryView, "Collection Details"],
        [OfficialReceiptAccountingEntryView, "Accounting Entries"],
      ] as const).map(([view, label]) => {
        const isActive = entryView === view;

        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onEntryViewChange(view)}
            className={joinClasses(
              "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
