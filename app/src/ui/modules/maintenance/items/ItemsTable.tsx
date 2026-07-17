"use client";

import { Search } from "lucide-react";
import {
	getItemsTableMinWidthClassName,
	ItemsTablePaginationStorageKey,
} from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";
import type { ItemsTableProps } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ItemsTableRow } from "@/app/src/ui/modules/maintenance/items/ItemsTableRow";

export function ItemsTable({
	isLoading,
	lastSyncedAt,
	setPendingStatusItem,
	table,
	toolbar,
}: ItemsTableProps) {
	const tableMinWidthClassName = getItemsTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<ModuleTable
			emptyDescription="Add an item master record to start classifying stock and bundles."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No items found"
			isLoading={isLoading}
			minWidthClassName={`${tableMinWidthClassName} table-fixed`}
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
