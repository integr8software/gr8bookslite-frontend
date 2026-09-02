import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  createProvisionalReceiptAccountingRows,
  calculateProvisionalReceiptTotals,
  formatProvisionalReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/provisional-receipt/ProvisionalReceiptData";
import { useProvisionalReceiptEntryColumns } from "@/app/src/hooks/modules/cash-receipt/provisional-receipt/useProvisionalReceiptEntryColumns";
import { useProvisionalReceiptEntryRows } from "@/app/src/hooks/modules/cash-receipt/provisional-receipt/useProvisionalReceiptEntryRows";
import type {
  ProvisionalReceiptEntryView,
  ProvisionalReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";
import {
  ProvisionalReceiptAccountingEntryView,
  ProvisionalReceiptCollectionEntryView,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptEntryColumns";
import { ModuleDataEntry, type ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  createProvisionalReceiptAccountingColumns,
  createProvisionalReceiptCollectionColumns,
} from "@/app/src/ui/modules/cash-receipt/provisional-receipt/entries/ProvisionalReceiptEntryTableColumns";

type ProvisionalReceiptEntriesProps = {
  entryView: ProvisionalReceiptEntryView;
  isReadonly: boolean;
  rows: ProvisionalReceiptLineEntry[];
  onEntryViewChange: (view: ProvisionalReceiptEntryView) => void;
  onOpenCollectionTypeDialog: () => void;
  onRowsChange: (rows: ProvisionalReceiptLineEntry[]) => void;
};

export function ProvisionalReceiptEntries({
  entryView,
  isReadonly,
  onEntryViewChange,
  onOpenCollectionTypeDialog,
  onRowsChange,
  rows,
}: ProvisionalReceiptEntriesProps) {
  const rowHandlers = useProvisionalReceiptEntryRows({ onRowsChange, rows });
  const totals = useMemo(() => calculateProvisionalReceiptTotals(rows), [rows]);
  const variance = Math.abs(totals.debit - totals.credit);
  const accountingRows = useMemo(() => createProvisionalReceiptAccountingRows(rows), [rows]);
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
  } = useProvisionalReceiptEntryColumns({ entryView, rows });

  const columns = useMemo<ModuleDataEntryColumn<ProvisionalReceiptLineEntry>[]>(
    () =>
      entryView === ProvisionalReceiptCollectionEntryView
        ? createProvisionalReceiptCollectionColumns(
            isReadonly,
            rowHandlers.updateEntry,
            collectionColumnOrder,
            visibleCollectionColumnIds,
            collectionColumnLabels,
            collectionColumnWidths,
          )
        : createProvisionalReceiptAccountingColumns(
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
        entryView === ProvisionalReceiptCollectionEntryView
          ? [
              { id: "csv", label: "CSV", onSelect: () => undefined },
              { id: "excel", label: "Excel", onSelect: () => undefined },
              { id: "pdf", label: "PDF", onSelect: () => undefined },
            ]
          : []
      }
      footerDetails={
        <span className={joinClasses("text-sm font-semibold", variance < 0.001 ? "text-emerald-700" : "text-coralpink")}>
          Variance: {formatProvisionalReceiptAmount(variance)}
        </span>
      }
      isDraggable
      isReadonly={entryView === ProvisionalReceiptAccountingEntryView ? true : isReadonly}
      canConfigureColumnsWhenReadonly
      rows={entryView === ProvisionalReceiptAccountingEntryView ? accountingRows : rows}
      summaryCells={
        entryView === ProvisionalReceiptAccountingEntryView
          ? {
              credit: formatProvisionalReceiptAmount(totals.credit),
              debit: formatProvisionalReceiptAmount(totals.debit),
              particulars: variance < 0.001 ? "Balanced" : `Difference: ${formatProvisionalReceiptAmount(variance)}`,
            }
          : undefined
      }
      toolbarActions={
        entryView === ProvisionalReceiptCollectionEntryView
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
      onImport={entryView === ProvisionalReceiptCollectionEntryView ? () => undefined : undefined}
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
  entryView: ProvisionalReceiptEntryView;
  onEntryViewChange: (view: ProvisionalReceiptEntryView) => void;
}) {
  return (
    <div role="tablist" aria-label="Entry view" className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
      {(
        [
          [ProvisionalReceiptCollectionEntryView, "Collection Details"],
          [ProvisionalReceiptAccountingEntryView, "Accounting Entries"],
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
