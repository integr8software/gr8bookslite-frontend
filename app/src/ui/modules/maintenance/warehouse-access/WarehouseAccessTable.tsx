"use client";

import { Search } from "lucide-react";
import { WarehouseAccessPaginationStorageKey } from "@/app/src/constants/modules/maintenance/warehouse-access/WarehouseAccessConstants";
import type { useWarehouseAccessListPage } from "@/app/src/hooks/modules/maintenance/warehouse-access/useWarehouseAccessListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseAccessTableRow } from "@/app/src/ui/modules/maintenance/warehouse-access/WarehouseAccessTableRow";

type WarehouseAccessTableProps = {
	hasActiveFilters: boolean;
	page: ReturnType<typeof useWarehouseAccessListPage>;
};

export function WarehouseAccessTable({
	hasActiveFilters,
	page,
}: WarehouseAccessTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Assign warehouse users to start managing access rights."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Warehouse Access Records Found"
				isLoading={page.isLoading}
				isSyncing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName="min-w-[78rem] table-fixed"
				paginationStorageKey={WarehouseAccessPaginationStorageKey}
				table={page.table}
				tableTitle="Warehouse access assignments"
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search warehouse access"
							placeholder="Search warehouse access"
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
					<WarehouseAccessTableRow
						key={row.id}
						row={row}
						onDeleteRecord={page.setPendingDelete}
					/>
				)}
			/>
		</div>
	);
}
