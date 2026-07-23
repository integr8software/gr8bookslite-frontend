"use client";

import { Search } from "lucide-react";
import { ItemVariationsPaginationStorageKey } from "@/app/src/constants/modules/item-management/item-variations/ItemVariationsConstants";
import type { ItemVariationsTableProps } from "@/app/src/types/modules/item-management/item-variations/ItemVariationsTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ItemVariationsTableRow } from "@/app/src/ui/modules/item-management/item-variations/ItemVariationsTableRow";

export function ItemVariationsTable({
  emptyDescription,
  emptyTitle,
  isLoading,
  isRefreshing,
  lastSyncedAt,
  table,
  toolbar,
  onEdit,
  onToggleStatus,
  onView,
}: ItemVariationsTableProps) {
  return (
    <ModuleTable
      emptyDescription={
        emptyDescription ?? "Add an item variation to start maintaining reusable item values."
      }
      emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
      emptyTitle={emptyTitle ?? "No item variations found"}
      isLoading={isLoading}
      isSyncing={isRefreshing}
      lastSyncedAt={lastSyncedAt}
      minWidthClassName="min-w-[64rem]"
      paginationStorageKey={ItemVariationsPaginationStorageKey}
      table={table}
      tableTitle="Item Variations"
      toolbar={toolbar}
      renderRow={(row) => (
        <ItemVariationsTableRow
          key={row.id}
          row={row}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onView={onView}
        />
      )}
    />
  );
}
