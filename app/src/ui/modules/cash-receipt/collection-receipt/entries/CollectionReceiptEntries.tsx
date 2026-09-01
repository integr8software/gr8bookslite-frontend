import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  createCollectionReceiptAccountingRows,
  calculateCollectionReceiptTotals,
  formatCollectionReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import { useCollectionReceiptEntryColumns } from "@/app/src/hooks/modules/cash-receipt/collection-receipt/useCollectionReceiptEntryColumns";
import { useCollectionReceiptEntryRows } from "@/app/src/hooks/modules/cash-receipt/collection-receipt/useCollectionReceiptEntryRows";
import type {
  CollectionReceiptEntryView,
  CollectionReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";
import {
  CollectionReceiptAccountingEntryView,
  CollectionReceiptCollectionEntryView,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptEntryColumns";
import { ModuleDataEntry, type ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  createCollectionReceiptAccountingColumns,
  createCollectionReceiptCollectionColumns,
} from "@/app/src/ui/modules/cash-receipt/collection-receipt/entries/CollectionReceiptEntryTableColumns";

type CollectionReceiptEntriesProps = {
  entryView: CollectionReceiptEntryView;
  isReadonly: boolean;
  rows: CollectionReceiptLineEntry[];
  onEntryViewChange: (view: CollectionReceiptEntryView) => void;
  onOpenCollectionTypeDialog: () => void;
  onRowsChange: (rows: CollectionReceiptLineEntry[]) => void;
};

export function CollectionReceiptEntries({
  entryView,
  isReadonly,
  onEntryViewChange,
  onOpenCollectionTypeDialog,
  onRowsChange,
  rows,
}: CollectionReceiptEntriesProps) {
  const rowHandlers = useCollectionReceiptEntryRows({ onRowsChange, rows });
  const totals = useMemo(() => calculateCollectionReceiptTotals(rows), [rows]);
  const variance = Math.abs(totals.debit - totals.credit);
  const accountingRows = useMemo(() => createCollectionReceiptAccountingRows(rows), [rows]);
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
  } = useCollectionReceiptEntryColumns({ entryView, rows });

  const columns = useMemo<ModuleDataEntryColumn<CollectionReceiptLineEntry>[]>(
    () =>
      entryView === CollectionReceiptCollectionEntryView
        ? createCollectionReceiptCollectionColumns(
            isReadonly,
            rowHandlers.updateEntry,
            collectionColumnOrder,
            visibleCollectionColumnIds,
            collectionColumnLabels,
            collectionColumnWidths,
          )
        : createCollectionReceiptAccountingColumns(
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
        entryView === CollectionReceiptCollectionEntryView
          ? [
              { id: "csv", label: "CSV", onSelect: () => undefined },
              { id: "excel", label: "Excel", onSelect: () => undefined },
              { id: "pdf", label: "PDF", onSelect: () => undefined },
            ]
          : []
      }
      footerDetails={
        <span className={joinClasses("text-sm font-semibold", variance < 0.001 ? "text-emerald-700" : "text-coralpink")}>
          Variance: {formatCollectionReceiptAmount(variance)}
        </span>
      }
      isDraggable
      isReadonly={entryView === CollectionReceiptAccountingEntryView ? true : isReadonly}
      canConfigureColumnsWhenReadonly
      rows={entryView === CollectionReceiptAccountingEntryView ? accountingRows : rows}
      summaryCells={
        entryView === CollectionReceiptAccountingEntryView
          ? {
              credit: formatCollectionReceiptAmount(totals.credit),
              debit: formatCollectionReceiptAmount(totals.debit),
              particulars: variance < 0.001 ? "Balanced" : `Difference: ${formatCollectionReceiptAmount(variance)}`,
            }
          : undefined
      }
      toolbarActions={
        entryView === CollectionReceiptCollectionEntryView
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
      title={<EntryViewTabs entryView={entryView} onEntryViewChange={onEntryViewChange} />}
      onAddRows={rowHandlers.addRows}
      onClearRows={rowHandlers.clearRows}
      onDuplicateRow={rowHandlers.duplicateRow}
      onImport={entryView === CollectionReceiptCollectionEntryView ? () => undefined : undefined}
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
  entryView: CollectionReceiptEntryView;
  onEntryViewChange: (view: CollectionReceiptEntryView) => void;
}) {
  return (
    <div role="tablist" aria-label="Entry view" className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
      {(
        [
          [CollectionReceiptCollectionEntryView, "Collection Details"],
          [CollectionReceiptAccountingEntryView, "Accounting Entries"],
        ] as const
      ).map(([view, label]) => {
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
