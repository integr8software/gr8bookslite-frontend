"use client";

import { Search } from "lucide-react";
import {
	WarehouseStoragePaginationStorageKey,
} from "@/app/src/constants/modules/warehouse-management/warehouse-storage/WarehouseStorageConstants";
import type { useWarehouseStorageListPage } from "@/app/src/hooks/modules/warehouse-management/warehouse-storage/useWarehouseStorageListPage";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseStorageTableRow } from "@/app/src/ui/modules/warehouse-management/warehouse-storage/WarehouseStorageTableRow";

type WarehouseStorageTableProps = {
	hasActiveFilters: boolean;
	onEditRecord: (record: WarehouseModuleRecord) => void;
	onViewRecord: (record: WarehouseModuleRecord) => void;
	page: ReturnType<typeof useWarehouseStorageListPage>;
};

export function WarehouseStorageTable({
	hasActiveFilters,
	onEditRecord,
	onViewRecord,
	page,
}: WarehouseStorageTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add storage locations to define simple areas, bins, shelves, or cold storage."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Storage Locations Found"
				isLoading={page.isLoading}
				isSyncing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName="min-w-[86rem] table-fixed"
				paginationStorageKey={WarehouseStoragePaginationStorageKey}
				table={page.table}
				tableTitle="Storage Locations"
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search storage locations"
							placeholder="Search code, name, warehouse, path"
							value={page.query}
							onChange={page.setQuery}
						/>
						<ModuleTableFilterSelect
							label="Warehouse"
							value={page.warehouseFilter}
							options={[
								{ label: "All Warehouses", value: "All" },
								...page.warehouses.map((warehouse) => ({
									label: warehouse.name,
									value: warehouse.id,
								})),
							]}
							onChange={page.setWarehouseFilter}
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
						<ModuleTableResetButton
							aria-label={hasActiveFilters ? "Reset filters" : "Refresh records"}
							isRefreshing={page.isRefreshing}
							onClick={hasActiveFilters ? page.resetFilters : page.refreshRecords}
						/>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<WarehouseStorageTableRow
						key={row.id}
						row={row}
						onDeleteRecord={page.setPendingDelete}
						onEditRecord={onEditRecord}
						onSelectRecord={(record) => page.setSelectedRecordId(record.id)}
						onViewRecord={onViewRecord}
					/>
				)}
			/>
		</div>
	);
}
