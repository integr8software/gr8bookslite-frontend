"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { ItemsTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type { useItemsListPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemsListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ItemsTableRow } from "@/app/src/ui/modules/maintenance/item-management/items/ItemsTableRow";

type ItemsTableProps = Pick<
	ReturnType<typeof useItemsListPage>,
	"isLoading" | "lastSyncedAt" | "setPendingStatusItem" | "table"
> & {
	toolbar?: ReactNode;
};

export function ItemsTable({
	isLoading,
	lastSyncedAt,
	setPendingStatusItem,
	table,
	toolbar,
}: ItemsTableProps) {
	return (
		<ModuleTable
			emptyDescription="Add an item master record to start classifying stock and bundles."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No items found"
			isLoading={isLoading}
			minWidthClassName="min-w-[96rem]"
			paginationStorageKey={ItemsTablePaginationStorageKey}
			lastSyncedAt={lastSyncedAt}
			table={table}
			tableTitle="Item master records"
			toolbar={toolbar}
			renderRow={({ id, original }) => (
				<ItemsTableRow
					key={id}
					item={original}
					onStatusChange={setPendingStatusItem}
				/>
			)}
		/>
	);
}
