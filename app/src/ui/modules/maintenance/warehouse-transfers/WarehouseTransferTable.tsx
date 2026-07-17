"use client";

import { Search } from "lucide-react";
import { WarehouseTransfersPaginationStorageKey } from "@/app/src/constants/modules/maintenance/warehouse-transfers/WarehouseTransferConstants";
import type { useWarehouseTransfersListPage } from "@/app/src/hooks/modules/maintenance/warehouse-transfers/useWarehouseTransfersListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseTransferTableRow } from "@/app/src/ui/modules/maintenance/warehouse-transfers/WarehouseTransferTableRow";

type WarehouseTransferTableProps = {
	hasActiveFilters: boolean;
	page: ReturnType<typeof useWarehouseTransfersListPage>;
};

export function WarehouseTransferTable({
	hasActiveFilters,
	page,
}: WarehouseTransferTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Create a transfer to track stock moving between warehouses."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Warehouse Transfers Found"
				isLoading={page.isLoading}
				isSyncing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName="min-w-[94rem] table-fixed"
				paginationStorageKey={WarehouseTransfersPaginationStorageKey}
				table={page.table}
				tableTitle="Warehouse transfers"
				toolbar={
					<ModuleTableToolbar>
						<ModuleTableSearch
							label="Search warehouse transfers"
							placeholder="Search warehouse transfers"
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
					<WarehouseTransferTableRow
						key={row.id}
						row={row}
						onDeleteRecord={page.setPendingDelete}
					/>
				)}
			/>
		</div>
	);
}
