import { useMemo, useState } from "react";
import {
  PettyCashFundDefaultItemColumnIds,
  PettyCashFundDefaultVisibleItemColumnIds,
  PettyCashFundItemColumnLabels,
  PettyCashFundItemColumnWidths,
  PettyCashFundProtectedItemColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import {
  createBlankPettyCashFundItem,
  formatPettyCashFundAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-fund/PettyCashFundData";
import {
  getPartyDefaultEwtCode,
  getPartyDefaultVatCode,
} from "@/app/src/data/shared/tax/PartyTaxDefaultsData";
import { createEwtOptions, createVatOptions } from "@/app/src/data/shared/tax/TaxData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useResponsibilityCenterLookup } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterLookup";
import type {
  PettyCashFundDetailEntryTableProps,
  PettyCashFundItemColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { createPettyCashFundItemColumns } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function PettyCashFundDetailEntryTable({
  onOpenResponsibilityCenterDrawer,
  onOpenSupplierDrawer,
  page,
}: PettyCashFundDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<PettyCashFundItemColumnId[]>([...PettyCashFundDefaultItemColumnIds]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<PettyCashFundItemColumnId[]>([...PettyCashFundDefaultVisibleItemColumnIds]);
  const [columnWidths, setColumnWidths] = useState({ ...PettyCashFundItemColumnWidths });
  const [columnLabels, setColumnLabels] = useState({ ...PettyCashFundItemColumnLabels });
  const partyRecords = usePartyManagementStore((state) => state.records);
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);

  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);

  const responsibilityCentersQuery = useResponsibilityCenterLookup();
  const responsibilityCenterOptions = useMemo(
    () => responsibilityCentersQuery.data ?? [],
    [responsibilityCentersQuery.data],
  );

  const supplierOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    const vendorRecords = partyRecords.filter((r) => r.partyTypes.includes("Vendor"));
    const options: AppAdvancedDropdownOption[] = vendorRecords.map((r) => ({
      defaultPurchaseEwtTaxSourceKey: r.defaultPurchaseEwtTaxSourceKey,
      defaultPurchaseInputVatTaxSourceKey: r.defaultPurchaseInputVatTaxSourceKey,
      ewtCode: getPartyDefaultEwtCode(r, taxCodes),
      label: r.partyCodeNo,
      name: getPartyDisplayName(r),
      vatCode: getPartyDefaultVatCode(r, taxCodes),
      value: r.partyCodeNo,
    }));

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
  }, [partyRecords, page.values.items, taxCodes]);

  const allColumns = useMemo(
    () =>
      createPettyCashFundItemColumns(
        page,
        columnLabels,
        columnWidths,
        supplierOptions,
        vatOptions,
        ewtOptions,
        responsibilityCenterOptions,
        onOpenResponsibilityCenterDrawer,
        onOpenSupplierDrawer,
      ),
    [
      columnLabels,
      columnWidths,
      ewtOptions,
      onOpenResponsibilityCenterDrawer,
      onOpenSupplierDrawer,
      page,
      responsibilityCenterOptions,
      supplierOptions,
      vatOptions,
    ],
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
        PettyCashFundProtectedItemColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isItemColumnId(fromId) && isItemColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isItemColumnId(columnId) && (!isVisible && PettyCashFundProtectedItemColumnIds.has(columnId))) {
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
    setColumnOrder([...PettyCashFundDefaultItemColumnIds]);
    setVisibleColumnIds([...PettyCashFundDefaultVisibleItemColumnIds]);
    setColumnWidths({ ...PettyCashFundItemColumnWidths });
    setColumnLabels({ ...PettyCashFundItemColumnLabels });
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title="Petty Cash Fund Entries"
      emptyRowLabel="entry"
      error={page.errors.items}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatPettyCashFundAmount(page.totals.amount)}
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
          page.values.items.map((row) => (row.id === rowId ? { ...createBlankPettyCashFundItem(), id: rowId } : row)),
        )
      }
      onClearRows={() => page.updateItems([createBlankPettyCashFundItem()])}
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
        amount: formatPettyCashFundAmount(page.totals.amount),
        netAmount: formatPettyCashFundAmount(page.totals.netAmount),
        vatAmount: formatPettyCashFundAmount(page.totals.vatAmount),
        ewtAmount: formatPettyCashFundAmount(page.totals.ewtAmount),
        disburseAmount: formatPettyCashFundAmount(page.totals.disburseAmount),
      }}
    />
  );
}

function isItemColumnId(columnId: string): columnId is PettyCashFundItemColumnId {
  return PettyCashFundDefaultItemColumnIds.includes(columnId as PettyCashFundItemColumnId);
}
