import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  createAcknowledgementReceiptAccountingRows,
  calculateAcknowledgementReceiptTotals,
  formatAcknowledgementReceiptAmount,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import { useAcknowledgementReceiptEntryColumns } from "@/app/src/hooks/modules/cash-receipt/acknowledgement-receipt/useAcknowledgementReceiptEntryColumns";
import { useAcknowledgementReceiptEntryRows } from "@/app/src/hooks/modules/cash-receipt/acknowledgement-receipt/useAcknowledgementReceiptEntryRows";
import type {
  AcknowledgementReceiptEntryView,
  AcknowledgementReceiptLineEntry,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import {
  AcknowledgementReceiptAccountingEntryView,
  AcknowledgementReceiptCollectionEntryView,
} from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptEntryColumns";
import { ModuleDataEntry, type ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  createAcknowledgementReceiptAccountingColumns,
  createAcknowledgementReceiptCollectionColumns,
} from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/entries/AcknowledgementReceiptEntryTableColumns";

type AcknowledgementReceiptEntriesProps = {
  entryView: AcknowledgementReceiptEntryView;
  isReadonly: boolean;
  rows: AcknowledgementReceiptLineEntry[];
  onEntryViewChange: (view: AcknowledgementReceiptEntryView) => void;
  onOpenCollectionTypeDialog: () => void;
  onRowsChange: (rows: AcknowledgementReceiptLineEntry[]) => void;
};

export function AcknowledgementReceiptEntries({
  entryView,
  isReadonly,
  onEntryViewChange,
  onOpenCollectionTypeDialog,
  onRowsChange,
  rows,
}: AcknowledgementReceiptEntriesProps) {
  const rowHandlers = useAcknowledgementReceiptEntryRows({ onRowsChange, rows });
  const totals = useMemo(() => calculateAcknowledgementReceiptTotals(rows), [rows]);
  const variance = Math.abs(totals.debit - totals.credit);
  const accountingRows = useMemo(() => createAcknowledgementReceiptAccountingRows(rows), [rows]);
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
  } = useAcknowledgementReceiptEntryColumns({ entryView, rows });

  const columns = useMemo<ModuleDataEntryColumn<AcknowledgementReceiptLineEntry>[]>(
    () =>
      entryView === AcknowledgementReceiptCollectionEntryView
        ? createAcknowledgementReceiptCollectionColumns(
            isReadonly,
            rowHandlers.updateEntry,
            collectionColumnOrder,
            visibleCollectionColumnIds,
            collectionColumnLabels,
            collectionColumnWidths,
          )
        : createAcknowledgementReceiptAccountingColumns(
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
        entryView === AcknowledgementReceiptCollectionEntryView
          ? [
              { id: "csv", label: "CSV", onSelect: () => undefined },
              { id: "excel", label: "Excel", onSelect: () => undefined },
              { id: "pdf", label: "PDF", onSelect: () => undefined },
            ]
          : []
      }
      footerDetails={
        <span className={joinClasses("text-sm font-semibold", variance < 0.001 ? "text-emerald-700" : "text-coralpink")}>
          Variance: {formatAcknowledgementReceiptAmount(variance)}
        </span>
      }
      isDraggable
      isReadonly={entryView === AcknowledgementReceiptAccountingEntryView ? true : isReadonly}
      canConfigureColumnsWhenReadonly
      rows={entryView === AcknowledgementReceiptAccountingEntryView ? accountingRows : rows}
      summaryCells={
        entryView === AcknowledgementReceiptAccountingEntryView
          ? {
              credit: formatAcknowledgementReceiptAmount(totals.credit),
              debit: formatAcknowledgementReceiptAmount(totals.debit),
              particulars: variance < 0.001 ? "Balanced" : `Difference: ${formatAcknowledgementReceiptAmount(variance)}`,
            }
          : undefined
      }
      toolbarActions={
        entryView === AcknowledgementReceiptCollectionEntryView
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
      onImport={entryView === AcknowledgementReceiptCollectionEntryView ? () => undefined : undefined}
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
  entryView: AcknowledgementReceiptEntryView;
  onEntryViewChange: (view: AcknowledgementReceiptEntryView) => void;
}) {
  return (
    <div role="tablist" aria-label="Entry view" className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
      {(
        [
          [AcknowledgementReceiptCollectionEntryView, "Collection Details"],
          [AcknowledgementReceiptAccountingEntryView, "Accounting Entries"],
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
