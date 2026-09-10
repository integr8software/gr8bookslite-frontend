"use client";

import { Search } from "lucide-react";
import { CollectionTypeTablePaginationStorageKey } from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import { getCollectionTypeTableMinWidthClassName } from "@/app/src/data/modules/financial-maintenance/collection-type/CollectionTypeData";
import { useCollectionTypeTable } from "@/app/src/hooks/modules/financial-maintenance/collection-type/useCollectionTypeTable";
import type { CollectionTypeTableProps } from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { CollectionTypeTableFilters } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeTableFilters";
import { CollectionTypeTableRow } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeTableRow";

export function CollectionTypeTable({
  collectionTypes,
  filteredCollectionTypes,
  hasActiveFilters,
  isLoading,
  isRefreshing,
  lastSyncedAt,
  permissions,
  query,
  statusFilter,
  typeFilter,
  showTypeTabs = true,
  title = "Collection Types",
  exportFileName = "collection-type",
  onEditCollectionType,
  onQueryChange,
  onRefresh,
  onStatusFilterChange,
  onToggleStatus,
  onTypeFilterChange,
  onViewCollectionType,
}: CollectionTypeTableProps) {
  const table = useCollectionTypeTable(filteredCollectionTypes);
  const tableMinWidthClassName = getCollectionTypeTableMinWidthClassName(table.getVisibleLeafColumns().length);

  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <ModuleTable
        variant="embedded"
        emptyDescription="Add a collection type to generate linked Chart of Accounts records."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No Collection Type Records Found"
        isLoading={isLoading}
        isSyncing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        minWidthClassName={`${tableMinWidthClassName} table-fixed`}
        paginationStorageKey={CollectionTypeTablePaginationStorageKey}
        table={table}
        tableTitle={title}
        toolbar={
          <CollectionTypeTableFilters
            exportAllRows={collectionTypes}
            exportFilteredRows={filteredCollectionTypes}
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
          <CollectionTypeTableRow
            key={row.id}
            row={row}
            permissions={permissions}
            onEditCollectionType={onEditCollectionType}
            onToggleStatus={onToggleStatus}
            onViewCollectionType={onViewCollectionType}
          />
        )}
      />
    </div>
  );
}
