"use client";

import { Search } from "lucide-react";
import {
	ItemCategoryPaginationStorageKey,
	getItemCategoryTableMinWidthClassName,
} from "@/app/src/constants/modules/maintenance/item-category/ItemCategoryConstants";
import { useItemCategoryTable } from "@/app/src/hooks/modules/maintenance/item-category/useItemCategoryTable";
import type { ItemCategoryTableProps } from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ItemCategoryTableFilters } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryTableFilters";
import { ItemCategoryTableRow } from "@/app/src/ui/modules/maintenance/item-category/ItemCategoryTableRow";

export function ItemCategoryTable({
	accountingFilter,
	allRows,
	expandedIds,
	filteredRows,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	permissions,
	query,
	statusFilter,
	onAccountingFilterChange,
	onEditRecord,
	onQueryChange,
	onRefresh,
	onStatusChange,
	onStatusFilterChange,
	onToggleExpanded,
	onViewRecord,
}: ItemCategoryTableProps) {
	const table = useItemCategoryTable(filteredRows);
	const exportFilteredRows = table
		.getPrePaginationRowModel()
		.rows.map((row) => row.original);
	const tableMinWidthClassName = getItemCategoryTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a category to start grouping inventory, services, and item groups."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No categories found"
				isLoading={isLoading}
				isSyncing={isRefreshing}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={ItemCategoryPaginationStorageKey}
				table={table}
				tableTitle="Item categories"
				toolbar={
					<ItemCategoryTableFilters
						accountingFilter={accountingFilter}
						exportAllRows={allRows}
						exportFilteredRows={exportFilteredRows}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						query={query}
						statusFilter={statusFilter}
						table={table}
						onAccountingFilterChange={onAccountingFilterChange}
						onQueryChange={onQueryChange}
						onRefresh={onRefresh}
						onStatusFilterChange={onStatusFilterChange}
					/>
				}
				renderRow={(row) => (
					<ItemCategoryTableRow
						key={row.id}
						expandedIds={expandedIds}
						permissions={permissions}
						row={row}
						onEditRecord={onEditRecord}
						onStatusChange={onStatusChange}
						onToggleExpanded={onToggleExpanded}
						onViewRecord={onViewRecord}
					/>
				)}
			/>
		</div>
	);
}
