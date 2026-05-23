"use client";

import { Search } from "lucide-react";
import { ItemsTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type { useItemsListPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemsListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ItemsTableRow } from "./ItemsTableRow";

type ItemsTableProps = Pick<
	ReturnType<typeof useItemsListPage>,
	"isLoading" | "setPendingDeleteItem" | "table"
>;

export function ItemsTable({
	isLoading,
	setPendingDeleteItem,
	table,
}: ItemsTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				emptyDescription="Add an item master record to start classifying stock and bundles."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No items found"
				isLoading={isLoading}
				minWidthClassName="min-w-[92rem]"
				paginationStorageKey={ItemsTablePaginationStorageKey}
				table={table}
				renderRow={({ id, original }) => (
					<ItemsTableRow
						key={id}
						item={original}
						onDeleteItem={setPendingDeleteItem}
					/>
				)}
			/>
		</div>
	);
}
