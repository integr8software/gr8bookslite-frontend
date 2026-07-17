import { Search } from "lucide-react";
import {
	ItemPromotionStatusFilterOptions,
	ItemPromotionsTablePaginationStorageKey,
} from "@/app/src/constants/modules/maintenance/item-promotions/ItemPromotionsConstants";
import type { useItemPromotionsListPage } from "@/app/src/hooks/modules/maintenance/item-promotions/useItemPromotionsListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ItemPromotionsTableRow } from "@/app/src/ui/modules/maintenance/item-promotions/ItemPromotionsTableRow";

type ItemPromotionsListPageState = ReturnType<typeof useItemPromotionsListPage>;

export function ItemPromotionsTable({
	page,
}: {
	page: ItemPromotionsListPageState;
}) {
	return (
		<ModuleTable
			emptyDescription="Add an item promotion to manage item-level discounts and offers."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No item promotions found"
			isLoading={page.isLoading}
			lastSyncedAt={page.lastSyncedAt}
			minWidthClassName="min-w-[116rem]"
			paginationStorageKey={ItemPromotionsTablePaginationStorageKey}
			table={page.table}
			tableTitle="Item promotions"
			toolbar={
				<ModuleTableToolbar>
					<ModuleTableSearch
						label="Search item promotions"
						placeholder="Search by promotion, type, item, value, or status"
						value={page.query}
						onChange={page.handleQueryChange}
					/>
					<ModuleTableFilterSelect
						label="Type"
						value={page.typeFilter}
						options={[
							{ label: "All", value: "All" },
							...page.typeOptions.map((type) => ({ label: type, value: type })),
						]}
						onChange={page.handleTypeFilterChange}
					/>
					<ModuleTableFilterSelect
						label="Status"
						value={page.statusFilter}
						options={ItemPromotionStatusFilterOptions}
						onChange={page.handleStatusFilterChange}
					/>
					<ModuleTableResetButton onClick={page.resetFilters} />
				</ModuleTableToolbar>
			}
			renderRow={({ id, original }) => (
				<ItemPromotionsTableRow
					key={id}
					row={original}
					onStatusChange={page.setPendingStatusRow}
				/>
			)}
		/>
	);
}
