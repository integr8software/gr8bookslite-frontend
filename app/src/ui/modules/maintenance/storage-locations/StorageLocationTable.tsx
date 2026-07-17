"use client";

import { Search } from "lucide-react";
import { StorageLocationsPaginationStorageKey } from "@/app/src/constants/modules/maintenance/storage-locations/StorageLocationConstants";
import type { useStorageLocationsListPage } from "@/app/src/hooks/modules/maintenance/storage-locations/useStorageLocationsListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { StorageLocationTableRow } from "@/app/src/ui/modules/maintenance/storage-locations/StorageLocationTableRow";

type StorageLocationTableProps = {
	hasActiveFilters: boolean;
	page: ReturnType<typeof useStorageLocationsListPage>;
};

export function StorageLocationTable({
	hasActiveFilters,
	page,
}: StorageLocationTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add storage locations to define warehouse bins and shelves."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Storage Locations Found"
				isLoading={page.isLoading}
				isSyncing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName="min-w-[86rem] table-fixed"
				paginationStorageKey={StorageLocationsPaginationStorageKey}
				table={page.table}
				tableTitle="Storage locations"
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search storage locations"
							placeholder="Search storage locations"
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
						<ModuleTableResetButton
							aria-label={hasActiveFilters ? "Reset filters" : "Refresh records"}
							isRefreshing={page.isRefreshing}
							onClick={hasActiveFilters ? page.resetFilters : page.refreshRecords}
						/>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<StorageLocationTableRow
						key={row.id}
						row={row}
						onDeleteRecord={page.setPendingDelete}
					/>
				)}
			/>
		</div>
	);
}
