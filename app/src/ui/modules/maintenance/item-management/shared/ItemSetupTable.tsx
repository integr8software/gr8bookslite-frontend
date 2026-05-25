"use client";

import { Search } from "lucide-react";
import { ItemSetupTablePaginationStorageKeys } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type { useItemSetupListPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemSetupListPage";
import type { ItemSetupKind } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ItemSetupTableRow } from "@/app/src/ui/modules/maintenance/item-management/shared/ItemSetupTableRow";

type ItemSetupTableProps = Pick<
	ReturnType<typeof useItemSetupListPage>,
	"isLoading" | "setPendingDeleteRecord" | "table"
> & {
	expandedIds: Set<string>;
	kind: ItemSetupKind;
	onToggleExpanded: (recordId: string) => void;
};

export function ItemSetupTable({
	expandedIds,
	isLoading,
	kind,
	onToggleExpanded,
	setPendingDeleteRecord,
	table,
}: ItemSetupTableProps) {
	return (
		<ModuleTable
			emptyDescription="Add a setup record to start classifying items."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No setup records found"
			isLoading={isLoading}
			minWidthClassName="min-w-[50rem]"
			paginationStorageKey={ItemSetupTablePaginationStorageKeys[kind]}
			table={table}
			renderRow={({ id, original }) => (
				<ItemSetupTableRow
					key={id}
					expandedIds={expandedIds}
					row={original}
					onDeleteRecord={setPendingDeleteRecord}
					onToggleExpanded={onToggleExpanded}
				/>
			)}
		/>
	);
}
