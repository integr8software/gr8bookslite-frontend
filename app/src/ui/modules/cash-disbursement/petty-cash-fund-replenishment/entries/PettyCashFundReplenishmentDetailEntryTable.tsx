import { useMemo, useState } from "react";
import {
  PettyCashFundReplenishmentEntryColumnOrder,
  PettyCashFundReplenishmentDefaultVisibleEntryColumnIds,
  PettyCashFundReplenishmentEntryColumnLabels,
  PettyCashFundReplenishmentEntryColumnWidths,
  PettyCashFundReplenishmentProtectedEntryColumnIds,
  PettyCashFundReplenishmentSupplierOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import {
  createBlankPettyCashFundReplenishmentEntry,
  formatPettyCashFundReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type {
  PettyCashFundReplenishmentDetailEntryTableProps,
  PettyCashFundReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { createPettyCashFundReplenishmentLineColumns } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/entries/PettyCashFundReplenishmentEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function PettyCashFundReplenishmentDetailEntryTable({
  onOpenSupplierDrawer,
  page,
}: PettyCashFundReplenishmentDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<PettyCashFundReplenishmentEntryColumnId[]>([
    ...PettyCashFundReplenishmentEntryColumnOrder,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<PettyCashFundReplenishmentEntryColumnId[]>([
    ...PettyCashFundReplenishmentDefaultVisibleEntryColumnIds,
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<PettyCashFundReplenishmentEntryColumnId, number>>({
    ...PettyCashFundReplenishmentEntryColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState<Record<PettyCashFundReplenishmentEntryColumnId, string>>({
    ...PettyCashFundReplenishmentEntryColumnLabels,
  });
  const partyRecords = usePartyManagementStore((state) => state.records);

  const supplierOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const vendorRecords = partyRecords.filter((r) => r.partyTypes.includes("Vendor"));
    const options: AppAdvancedDropdownOption[] =
      vendorRecords.length > 0
        ? vendorRecords.map((r) => ({
            label: r.partyCodeNo,
            name: getPartyDisplayName(r),
            value: r.partyCodeNo,
          }))
        : PettyCashFundReplenishmentSupplierOptions;

    const existingCodes = new Set(options.map((opt) => opt.value));
    const existingNames = new Set(options.map((opt) => opt.name.toLowerCase()));
    const extraOptions: AppAdvancedDropdownOption[] = [];

    page.values.entries.forEach((entry) => {
      if (entry.supplierName && !existingNames.has(entry.supplierName.toLowerCase())) {
        const code = entry.supplierCode || entry.supplierName;
        if (!existingCodes.has(code)) {
          existingCodes.add(code);
          existingNames.add(entry.supplierName.toLowerCase());
          extraOptions.push({
            label: entry.supplierCode || code,
            name: entry.supplierName,
            value: code,
          });
        }
      }
    });

    return [...options, ...extraOptions];
  }, [partyRecords, page.values.entries]);

  const allColumns = useMemo(
    () =>
      createPettyCashFundReplenishmentLineColumns({
        columnLabels,
        columnWidths,
        onOpenSupplierDrawer,
        page,
        supplierOptions,
      }),
    [columnLabels, columnWidths, onOpenSupplierDrawer, page, supplierOptions],
  );

  const columns = useMemo(
    () => columnOrder.filter((id) => visibleColumnIds.includes(id)).map((id) => allColumns[id]),
    [allColumns, columnOrder, visibleColumnIds],
  );

  const columnOptions = useMemo(
    () =>
      buildColumnOptions(
        columnOrder,
        columnLabels,
        columnWidths,
        visibleColumnIds,
        PettyCashFundReplenishmentProtectedEntryColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isLineColumnId(fromId) && isLineColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isLineColumnId(columnId) && (!isVisible && PettyCashFundReplenishmentProtectedEntryColumnIds.has(columnId))) {
      return;
    }
    if (isLineColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isLineColumnId(columnId)) {
      setColumnLabels((labels: Record<PettyCashFundReplenishmentEntryColumnId, string>) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isLineColumnId(columnId)) {
      setColumnWidths((widths: Record<PettyCashFundReplenishmentEntryColumnId, number>) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isLineColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], page.values.entries, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...PettyCashFundReplenishmentEntryColumnOrder]);
    setVisibleColumnIds([...PettyCashFundReplenishmentDefaultVisibleEntryColumnIds]);
    setColumnWidths({ ...PettyCashFundReplenishmentEntryColumnWidths });
    setColumnLabels({ ...PettyCashFundReplenishmentEntryColumnLabels });
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title="Petty Cash Voucher Entries"
      emptyRowLabel="entry"
      error={page.errors.entries}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatPettyCashFundReplenishmentAmount(page.totals.totalAmount)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={page.values.entries}
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addEntries}
      onClearRow={(rowId) =>
        page.updateEntries(
          page.values.entries.map((row) =>
            row.id === rowId ? { ...createBlankPettyCashFundReplenishmentEntry(), id: rowId } : row,
          ),
        )
      }
      onClearRows={() => page.updateEntries([createBlankPettyCashFundReplenishmentEntry()])}
      onDuplicateRow={page.duplicateEntry}
      onInsertRow={page.insertEntry}
      onMoveRow={page.moveEntry}
      onRemoveRow={page.removeEntry}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        amount: formatPettyCashFundReplenishmentAmount(page.totals.totalAmount),
        netAmount: formatPettyCashFundReplenishmentAmount(page.totals.netAmount),
        vatAmount: formatPettyCashFundReplenishmentAmount(page.totals.vatAmount),
        ewtAmount: formatPettyCashFundReplenishmentAmount(page.totals.ewtAmount),
      }}
    />
  );
}

function isLineColumnId(columnId: string): columnId is PettyCashFundReplenishmentEntryColumnId {
  return PettyCashFundReplenishmentEntryColumnOrder.includes(columnId as PettyCashFundReplenishmentEntryColumnId);
}
