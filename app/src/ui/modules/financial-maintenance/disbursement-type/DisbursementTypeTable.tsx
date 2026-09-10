"use client";

import { Search } from "lucide-react";
import { DisbursementTypeTablePaginationStorageKey } from "@/app/src/constants/modules/financial-maintenance/disbursement-type/DisbursementTypeConstants";
import { getDisbursementTypeTableMinWidthClassName } from "@/app/src/data/modules/financial-maintenance/disbursement-type/DisbursementTypeMaintenanceData";
import { useDisbursementTypeTable } from "@/app/src/hooks/modules/financial-maintenance/disbursement-type/useDisbursementTypeTable";
import type { DisbursementTypeTableProps } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { DisbursementTypeTableFilters } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeTableFilters";
import { DisbursementTypeTableRow } from "@/app/src/ui/modules/financial-maintenance/disbursement-type/DisbursementTypeTableRow";

export function DisbursementTypeTable({
  disbursementTypes,
  filteredDisbursementTypes,
  hasActiveFilters,
  isLoading,
  isRefreshing,
  lastSyncedAt,
  permissions,
  query,
  statusFilter,
  typeFilter,
  showTypeTabs = true,
  title = "Disbursement Types",
  exportFileName = "disbursement-type",
  onEditDisbursementType,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onToggleStatus,
  onTypeFilterChange,
  onViewDisbursementType,
}: DisbursementTypeTableProps) {
  const table = useDisbursementTypeTable(filteredDisbursementTypes);
  const tableMinWidthClassName = getDisbursementTypeTableMinWidthClassName(table.getVisibleLeafColumns().length);

  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <ModuleTable
        variant="embedded"
        emptyDescription="Add a disbursement type to generate linked Chart of Accounts records."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No Disbursement Type Records Found"
        isLoading={isLoading}
        isSyncing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        minWidthClassName={`${tableMinWidthClassName} table-fixed`}
        paginationStorageKey={DisbursementTypeTablePaginationStorageKey}
        table={table}
        tableTitle={title}
        toolbar={
          <DisbursementTypeTableFilters
            exportAllRows={disbursementTypes}
            exportFilteredRows={filteredDisbursementTypes}
            hasActiveFilters={hasActiveFilters}
            isRefreshing={isRefreshing}
            permissions={permissions}
            query={query}
            statusFilter={statusFilter}
            table={table}
            typeFilter={typeFilter}
            showTypeTabs={showTypeTabs}
            title={title}
            exportFileName={exportFileName}
            onQueryChange={onQueryChange}
            onRefresh={onRefresh}
            onStatusFilterChange={onStatusFilterChange}
            onTypeFilterChange={onTypeFilterChange}
          />
        }
        renderRow={(row) => (
          <DisbursementTypeTableRow
            key={row.id}
            row={row}
            permissions={permissions}
            onEditDisbursementType={onEditDisbursementType}
            onToggleStatus={onToggleStatus}
            onViewDisbursementType={onViewDisbursementType}
          />
        )}
      />
    </div>
  );
}
