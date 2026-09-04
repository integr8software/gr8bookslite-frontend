import { useMemo, useState } from "react";
import {
  RevolvingFundReplenishmentEntryColumnOrder,
  RevolvingFundReplenishmentDefaultVisibleEntryColumnIds,
  RevolvingFundReplenishmentEntryColumnLabels,
  RevolvingFundReplenishmentEntryColumnWidths,
  RevolvingFundReplenishmentProtectedEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import {
  createBlankRevolvingFundReplenishmentEntry,
  formatRevolvingFundReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import {
  getPartyDefaultEwtCode,
  getPartyDefaultVatCode,
} from "@/app/src/data/shared/tax/PartyTaxDefaultsData";
import { createEwtOptions, createVatOptions } from "@/app/src/data/shared/tax/TaxData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useMaintenanceResponsibilityCenterOptions } from "@/app/src/hooks/shared/maintenance/useMaintenanceResponsibilityCenterOptions";
import type {
  RevolvingFundReplenishmentDetailEntryTableProps,
  RevolvingFundReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { createRevolvingFundReplenishmentLineColumns } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/entries/RevolvingFundReplenishmentEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function RevolvingFundReplenishmentDetailEntryTable({
  onOpenSupplierDrawer,
  page,
}: RevolvingFundReplenishmentDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<RevolvingFundReplenishmentEntryColumnId[]>([
    ...RevolvingFundReplenishmentEntryColumnOrder,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<RevolvingFundReplenishmentEntryColumnId[]>([
    ...RevolvingFundReplenishmentDefaultVisibleEntryColumnIds,
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<RevolvingFundReplenishmentEntryColumnId, number>>({
    ...RevolvingFundReplenishmentEntryColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState<Record<RevolvingFundReplenishmentEntryColumnId, string>>({
    ...RevolvingFundReplenishmentEntryColumnLabels,
  });
  const partyRecords = usePartyManagementStore((state) => state.records);
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);

  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);

  const responsibilityCentersQuery = useMaintenanceResponsibilityCenterOptions();
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
  }, [partyRecords, page.values.entries, taxCodes]);

  const allColumns = useMemo(
    () =>
      createRevolvingFundReplenishmentLineColumns({
        columnLabels,
        columnWidths,
        ewtOptions,
        onOpenSupplierDrawer,
        page,
        responsibilityCenterOptions,
        supplierOptions,
        vatOptions,
      }),
    [columnLabels, columnWidths, ewtOptions, onOpenSupplierDrawer, page, responsibilityCenterOptions, supplierOptions, vatOptions],
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
        RevolvingFundReplenishmentProtectedEntryColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isLineColumnId(fromId) && isLineColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isLineColumnId(columnId) && (!isVisible && RevolvingFundReplenishmentProtectedEntryColumnIds.has(columnId))) {
      return;
    }
    if (isLineColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isLineColumnId(columnId)) {
      setColumnLabels((labels: Record<RevolvingFundReplenishmentEntryColumnId, string>) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isLineColumnId(columnId)) {
      setColumnWidths((widths: Record<RevolvingFundReplenishmentEntryColumnId, number>) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isLineColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], page.values.entries, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...RevolvingFundReplenishmentEntryColumnOrder]);
    setVisibleColumnIds([...RevolvingFundReplenishmentDefaultVisibleEntryColumnIds]);
    setColumnWidths({ ...RevolvingFundReplenishmentEntryColumnWidths });
    setColumnLabels({ ...RevolvingFundReplenishmentEntryColumnLabels });
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title="Revolving Fund Entries"
      emptyRowLabel="entry"
      error={page.errors.entries}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatRevolvingFundReplenishmentAmount(page.totals.totalAmount)}
        </span>
      }
      columns={columns}
      columnOptions={columnOptions}
      rows={page.values.entries}
      canConfigureColumnsWhenReadonly
      isDraggable={!page.isReadonly}
      isReadonly={page.isReadonly}
      onAddRows={page.addEntries}
      onClearRow={(rowId) =>
        page.updateEntries(
          page.values.entries.map((row) =>
            row.id === rowId ? { ...createBlankRevolvingFundReplenishmentEntry(), id: rowId } : row,
          ),
        )
      }
      onClearRows={() => page.updateEntries([createBlankRevolvingFundReplenishmentEntry()])}
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
        amount: formatRevolvingFundReplenishmentAmount(page.totals.totalAmount),
        netAmount: formatRevolvingFundReplenishmentAmount(page.totals.netAmount),
        vatAmount: formatRevolvingFundReplenishmentAmount(page.totals.vatAmount),
        ewtAmount: formatRevolvingFundReplenishmentAmount(page.totals.ewtAmount),
        disburseAmount: formatRevolvingFundReplenishmentAmount(page.totals.disburseAmount),
      }}
    />
  );
}

function isLineColumnId(columnId: string): columnId is RevolvingFundReplenishmentEntryColumnId {
  return RevolvingFundReplenishmentEntryColumnOrder.includes(columnId as RevolvingFundReplenishmentEntryColumnId);
}
