import { useMemo, useState } from "react";
import {
  PettyCashReplenishmentEntryColumnOrder,
  PettyCashReplenishmentDefaultVisibleEntryColumnIds,
  PettyCashReplenishmentEntryColumnLabels,
  PettyCashReplenishmentEntryColumnWidths,
  PettyCashReplenishmentProtectedEntryColumnIds,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import {
  createBlankPettyCashReplenishmentEntry,
  formatPettyCashReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import {
  getPartyDefaultEwtCode,
  getPartyDefaultVatCode,
} from "@/app/src/data/shared/tax/PartyTaxDefaultsData";
import { createEwtOptions, createVatOptions } from "@/app/src/data/shared/tax/TaxData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { fetchMaintenanceResponsibilityCenterOptions } from "@/app/src/services/shared/maintenance/MaintenanceLookupApi";
import { useQuery } from "@tanstack/react-query";
import type {
  PettyCashReplenishmentDetailEntryTableProps,
  PettyCashReplenishmentEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { createPettyCashReplenishmentLineColumns } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/entries/PettyCashReplenishmentEntryColumns";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import {
  buildColumnOptions,
  calculateFitColumnWidth,
  reorderColumnIds,
  toggleVisibleColumnId,
} from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";

export function PettyCashReplenishmentDetailEntryTable({
  onOpenSupplierDrawer,
  page,
}: PettyCashReplenishmentDetailEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<PettyCashReplenishmentEntryColumnId[]>([
    ...PettyCashReplenishmentEntryColumnOrder,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<PettyCashReplenishmentEntryColumnId[]>([
    ...PettyCashReplenishmentDefaultVisibleEntryColumnIds,
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<PettyCashReplenishmentEntryColumnId, number>>({
    ...PettyCashReplenishmentEntryColumnWidths,
  });
  const [columnLabels, setColumnLabels] = useState<Record<PettyCashReplenishmentEntryColumnId, string>>({
    ...PettyCashReplenishmentEntryColumnLabels,
  });
  const partyRecords = usePartyManagementStore((state) => state.records);
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);

  const vatOptions = useMemo(() => createVatOptions(taxCodes), [taxCodes]);
  const ewtOptions = useMemo(() => createEwtOptions(taxCodes), [taxCodes]);

  const responsibilityCentersQuery = useQuery({
    queryKey: ["cash-disbursement", "petty-cash-replenishment", "responsibility-centers"],
    queryFn: fetchMaintenanceResponsibilityCenterOptions,
    staleTime: 60_000,
  });
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
      createPettyCashReplenishmentLineColumns({
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
        PettyCashReplenishmentProtectedEntryColumnIds,
      ),
    [columnLabels, columnOrder, columnWidths, visibleColumnIds],
  );

  function handleMoveColumn(fromId: string, toId: string) {
    if (isLineColumnId(fromId) && isLineColumnId(toId)) {
      setColumnOrder((order) => reorderColumnIds(order, fromId, toId));
    }
  }

  function handleToggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (isLineColumnId(columnId) && (!isVisible && PettyCashReplenishmentProtectedEntryColumnIds.has(columnId))) {
      return;
    }
    if (isLineColumnId(columnId)) {
      setVisibleColumnIds((ids) => toggleVisibleColumnId(ids, columnOrder, columnId, isVisible));
    }
  }

  function handleUpdateColumnHeader(columnId: string, header: string) {
    if (isLineColumnId(columnId)) {
      setColumnLabels((labels: Record<PettyCashReplenishmentEntryColumnId, string>) => ({ ...labels, [columnId]: header }));
    }
  }

  function handleUpdateColumnWidth(columnId: string, width: number) {
    if (isLineColumnId(columnId)) {
      setColumnWidths((widths: Record<PettyCashReplenishmentEntryColumnId, number>) => ({ ...widths, [columnId]: clampColumnWidth(width) }));
    }
  }

  function handleFitColumnWidth(columnId: string) {
    if (isLineColumnId(columnId)) {
      const fitWidth = calculateFitColumnWidth(columnLabels[columnId], page.values.entries, columnId);
      handleUpdateColumnWidth(columnId, fitWidth);
    }
  }

  function handleResetColumns() {
    setColumnOrder([...PettyCashReplenishmentEntryColumnOrder]);
    setVisibleColumnIds([...PettyCashReplenishmentDefaultVisibleEntryColumnIds]);
    setColumnWidths({ ...PettyCashReplenishmentEntryColumnWidths });
    setColumnLabels({ ...PettyCashReplenishmentEntryColumnLabels });
  }

  return (
    <ModuleDataEntry
      addButtonLabel="Add Entry"
      title="Petty Cash Voucher Entries"
      emptyRowLabel="entry"
      error={page.errors.entries}
      footerDetails={
        <span className="text-sm font-semibold text-darknavy">
          Total Amount: {formatPettyCashReplenishmentAmount(page.totals.totalAmount)}
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
            row.id === rowId ? { ...createBlankPettyCashReplenishmentEntry(), id: rowId } : row,
          ),
        )
      }
      onClearRows={() => page.updateEntries([createBlankPettyCashReplenishmentEntry()])}
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
        amount: formatPettyCashReplenishmentAmount(page.totals.totalAmount),
        netAmount: formatPettyCashReplenishmentAmount(page.totals.netAmount),
        vatAmount: formatPettyCashReplenishmentAmount(page.totals.vatAmount),
        ewtAmount: formatPettyCashReplenishmentAmount(page.totals.ewtAmount),
        disburseAmount: formatPettyCashReplenishmentAmount(page.totals.disburseAmount),
      }}
    />
  );
}

function isLineColumnId(columnId: string): columnId is PettyCashReplenishmentEntryColumnId {
  return PettyCashReplenishmentEntryColumnOrder.includes(columnId as PettyCashReplenishmentEntryColumnId);
}
