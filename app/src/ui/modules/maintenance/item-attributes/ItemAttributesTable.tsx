"use client";

import { Search } from "lucide-react";
import { ItemAttributesPaginationStorageKey } from "@/app/src/constants/modules/maintenance/item-attributes/ItemAttributesConstants";
import type { ItemAttributesTableProps } from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ItemAttributesTableRow } from "@/app/src/ui/modules/maintenance/item-attributes/ItemAttributesTableRow";

export function ItemAttributesTable({
	table,
	toolbar,
	onEdit,
	onToggleStatus,
	onView,
}: ItemAttributesTableProps) {
	return (
		<ModuleTable
			emptyDescription="Add an item attribute to start maintaining reusable item values."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No item attributes found"
			minWidthClassName="min-w-[64rem]"
			paginationStorageKey={ItemAttributesPaginationStorageKey}
			table={table}
			tableTitle="Item attributes"
			toolbar={toolbar}
			renderRow={(row) => (
				<ItemAttributesTableRow
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
