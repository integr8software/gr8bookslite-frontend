"use client";

import { Search } from "lucide-react";
import { getWarehouseTableMinWidthClassName, WarehouseTablePaginationStorageKey } from "@/app/src/constants/modules/warehouse-management/warehouses/WarehouseConstants";
import type { WarehouseTableProps } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { WarehouseTableRow } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseTableRow";

export function WarehouseTable({ isLoading, lastSyncedAt, permissions, setPendingDeleteWarehouse, table, toolbar, onEditWarehouse, onViewWarehouse }: WarehouseTableProps) {
  const tableMinWidthClassName = getWarehouseTableMinWidthClassName(table.getVisibleLeafColumns().length);

  return (
    <ModuleTable
      emptyDescription="Add a warehouse to start tracking access and item counts."
      emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
      emptyTitle="No warehouses found"
      isLoading={isLoading}
      lastSyncedAt={lastSyncedAt}
      minWidthClassName={`${tableMinWidthClassName} table-fixed`}
      paginationStorageKey={WarehouseTablePaginationStorageKey}
      table={table}
      tableTitle="Warehouses"
      toolbar={toolbar}
      renderRow={({ id, original }) => (
        <WarehouseTableRow
          key={id}
          permissions={permissions}
          warehouse={original}
          visibleColumnIds={table.getVisibleLeafColumns().map((column) => column.id)}
          onDeleteWarehouse={setPendingDeleteWarehouse}
          onEditWarehouse={onEditWarehouse}
          onViewWarehouse={onViewWarehouse}
        />
      )}
    />
  );
}
