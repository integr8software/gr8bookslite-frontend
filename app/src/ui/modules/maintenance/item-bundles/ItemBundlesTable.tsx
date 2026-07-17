import { Search } from "lucide-react";
import { ItemBundleStatusFilterOptions, ItemBundlesTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/item-bundles/ItemBundlesConstants";
import type { useItemBundlesListPage } from "@/app/src/hooks/modules/maintenance/item-bundles/useItemBundlesListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ItemBundlesTableRow } from "@/app/src/ui/modules/maintenance/item-bundles/ItemBundlesTableRow";

type ItemBundlesListPageState = ReturnType<typeof useItemBundlesListPage>;

export function ItemBundlesTable({ page }: { page: ItemBundlesListPageState }) {
	return (
		<ModuleTable
			emptyDescription="Add a bundle to group multiple component items under one sales item."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No item bundles found"
			isLoading={page.isLoading}
			lastSyncedAt={page.lastSyncedAt}
			minWidthClassName="min-w-[96rem]"
			paginationStorageKey={ItemBundlesTablePaginationStorageKey}
			table={page.table}
			tableTitle="Item bundles"
			toolbar={
				<ModuleTableToolbar>
					<ModuleTableSearch
						label="Search item bundles"
						placeholder="Search by bundle, code, component, or status"
						value={page.query}
						onChange={page.handleQueryChange}
					/>
					<ModuleTableFilterSelect
						label="Status"
						value={page.statusFilter}
						options={ItemBundleStatusFilterOptions}
						onChange={page.handleStatusFilterChange}
					/>
					<ModuleTableResetButton onClick={page.resetFilters} />
				</ModuleTableToolbar>
			}
			renderRow={({ id, original }) => (
				<ItemBundlesTableRow
					key={id}
					row={original}
					onStatusChange={page.setPendingStatusRow}
				/>
			)}
		/>
	);
}
