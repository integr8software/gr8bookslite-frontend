import { useMemo, useState } from "react";
import {
  RevolvingFundDefaultItemColumnIds,
  RevolvingFundDefaultVisibleItemColumnIds,
  RevolvingFundItemColumnLabels,
  RevolvingFundItemColumnWidths,
  RevolvingFundProtectedItemColumnIds,
  RevolvingFundSupplierOptions,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import {
  createBlankRevolvingFundItem,
  formatRevolvingFundAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund/RevolvingFundData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type {
  RevolvingFundDetailEntryTableProps,
  RevolvingFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { createRevolvingFundItemColumns } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/entries/RevolvingFundEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function RevolvingFundDetailEntryTable({
  onOpenResponsibilityCenterDrawer,
  onOpenSupplierDrawer,
  page,
}: RevolvingFundDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<RevolvingFundItemColumnId[]>([...RevolvingFundDefaultItemColumnIds]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<RevolvingFundItemColumnId[]>([...RevolvingFundDefaultVisibleItemColumnIds]);
  const [columnWidths, setColumnWidths] = useState({ ...RevolvingFundItemColumnWidths });
  const [columnLabels, setColumnLabels] = useState({ ...RevolvingFundItemColumnLabels });
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
        : RevolvingFundSupplierOptions;

    const existingCodes = new Set(options.map((opt) => opt.value));
    const existingNames = new Set(options.map((opt) => opt.name.toLowerCase()));
    const extraOptions: AppAdvancedDropdownOption[] = [];

    page.values.items.forEach((item) => {
      if (item.supplierName && !existingNames.has(item.supplierName.toLowerCase())) {
        const code = item.supplierCode || item.supplierName;
        if (!existingCodes.has(code)) {
          existingCodes.add(code);
          existingNames.add(item.supplierName.toLowerCase());
          extraOptions.push({
            label: item.supplierCode || code,
            name: item.supplierName,
            value: code,
          });
        }
      }
    });

    return [...options, ...extraOptions];
  }, [partyRecords, page.values.items]);

  const allColumns = useMemo(
    () =>
      createRevolvingFundItemColumns(
        page,
        columnLabels,
        columnWidths,
        supplierOptions,
        onOpenResponsibilityCenterDrawer,
        onOpenSupplierDrawer,
      ),
    [columnLabels, columnWidths, onOpenResponsibilityCenterDrawer, onOpenSupplierDrawer, page, supplierOptions],
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
        RevolvingFundProtectedItemColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isItemColumnId(fromId) && isItemColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isItemColumnId(columnId) && (!isVisible && RevolvingFundProtectedItemColumnIds.has(columnId))) {
      return;
    }
    if (isItemColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isItemColumnId(columnId)) {
      setColumnLabels((labels) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isItemColumnId(columnId)) {
      setColumnWidths((widths) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isItemColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], page.values.items, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...RevolvingFundDefaultItemColumnIds]);
    setVisibleColumnIds([...RevolvingFundDefaultVisibleItemColumnIds]);
    setColumnWidths({ ...RevolvingFundItemColumnWidths });
    setColumnLabels({ ...RevolvingFundItemColumnLabels });
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title="Revolving Fund Entries"
      emptyRowLabel="entry"
      error={page.errors.items}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatRevolvingFundAmount(page.totals.amount)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={page.values.items}
      canConfigureColumnsWhenReadonly
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addItems}
      onClearRow={(rowId) =>
        page.updateItems(
          page.values.items.map((row) => (row.id === rowId ? { ...createBlankRevolvingFundItem(), id: rowId } : row)),
        )
      }
      onClearRows={() => page.updateItems([createBlankRevolvingFundItem()])}
      onDuplicateRow={page.duplicateItem}
      onInsertRow={page.insertItem}
      onMoveRow={page.moveItem}
      onRemoveRow={page.removeItem}
      onAutoColumnWidth={handleFitColumnWidth}
      onFitColumnWidth={handleFitColumnWidth}
      onMoveColumn={handleMoveColumn}
      onResetColumns={handleResetColumns}
      onToggleColumnVisibility={handleToggleColumnVisibility}
      onUpdateColumnHeader={handleUpdateColumnHeader}
      onUpdateColumnWidth={handleUpdateColumnWidth}
      summaryRowHeader="Totals"
      summaryCells={{
        amount: formatRevolvingFundAmount(page.totals.amount),
        netAmount: formatRevolvingFundAmount(page.totals.netAmount),
        vatAmount: formatRevolvingFundAmount(page.totals.vatAmount),
        ewtAmount: formatRevolvingFundAmount(page.totals.ewtAmount),
        disburseAmount: formatRevolvingFundAmount(page.totals.disburseAmount),
      }}
    />
  );
}

function isItemColumnId(columnId: string): columnId is RevolvingFundItemColumnId {
  return RevolvingFundDefaultItemColumnIds.includes(columnId as RevolvingFundItemColumnId);
}
