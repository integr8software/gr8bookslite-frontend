"use client";

import { Search } from "lucide-react";
import {
	getWarehouseInventoryStockTableMinWidthClassName,
	WarehouseInventoryStockExportColumns,
	WarehouseInventoryStockPaginationStorageKey,
} from "@/app/src/constants/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockConstants";
import type { useWarehouseInventoryStockListPage } from "@/app/src/hooks/modules/warehouse-management/warehouse-inventory-stock/useWarehouseInventoryStockListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseInventoryStockTableRow } from "@/app/src/ui/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockTableRow";

type WarehouseInventoryStockTableProps = {
	hasActiveFilters: boolean;
	page: ReturnType<typeof useWarehouseInventoryStockListPage>;
};

export function WarehouseInventoryStockTable({
	hasActiveFilters,
	page,
}: WarehouseInventoryStockTableProps) {
	const tableMinWidthClassName = getWarehouseInventoryStockTableMinWidthClassName(
		page.table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="No availability rows match the current filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Item Availability Found"
				isLoading={page.isLoading}
				isSyncing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={WarehouseInventoryStockPaginationStorageKey}
				table={page.table}
				tableTitle="Item Availability"
				toolbar={
					<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
						<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)]">
							<ModuleTableSearch
								label="Search item availability"
								placeholder="Search item availability"
								value={page.query}
								onChange={page.setQuery}
							/>
							<ModuleTableFilterSelect
								label="Status"
								value={page.statusFilter}
								options={[
									{ label: "All", value: "All" },
									...page.statuses.map((status) => ({
										label: status,
										value: status,
									})),
								]}
								onChange={page.setStatusFilter}
							/>
						</div>
						<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
							<ModuleTableColumnVisibilityButton table={page.table} />
							<ModuleTableExportButton
								allRows={page.records}
								columns={WarehouseInventoryStockExportColumns}
								fileName="warehouse-inventory-stock"
								filteredRows={page.filteredRecords}
								isFiltered={hasActiveFilters}
								table={page.table}
								title="Item Availability"
							/>
							<ModuleTableResetButton
								aria-label={hasActiveFilters ? "Reset filters" : "Refresh inquiry"}
								className="px-2"
								isRefreshing={page.isRefreshing}
								onClick={hasActiveFilters ? page.resetFilters : page.refreshRecords}
							/>
						</div>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<WarehouseInventoryStockTableRow key={row.id} row={row} />
				)}
			/>
		</div>
	);
}
