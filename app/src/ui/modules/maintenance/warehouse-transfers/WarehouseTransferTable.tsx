"use client";

import { Search } from "lucide-react";
import {
	getWarehouseTransfersTableMinWidthClassName,
	WarehouseTransfersExportColumns,
	WarehouseTransfersPaginationStorageKey,
} from "@/app/src/constants/modules/maintenance/warehouse-transfers/WarehouseTransferConstants";
import type { useWarehouseTransfersListPage } from "@/app/src/hooks/modules/maintenance/warehouse-transfers/useWarehouseTransfersListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
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
	const tableMinWidthClassName = getWarehouseTransfersTableMinWidthClassName(
		page.table.getVisibleLeafColumns().length,
	);

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
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={WarehouseTransfersPaginationStorageKey}
				table={page.table}
				tableTitle="Warehouse transfers"
				toolbar={
					<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
						<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)]">
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
						</div>
						<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
							<ModuleTableColumnVisibilityButton table={page.table} />
							<ModuleTableExportButton
								allRows={page.records}
								columns={WarehouseTransfersExportColumns}
								fileName="warehouse-transfers"
								filteredRows={page.filteredRecords}
								isFiltered={hasActiveFilters}
								table={page.table}
								title="Warehouse Transfers"
							/>
							<ModuleTableResetButton
								aria-label={hasActiveFilters ? "Reset filters" : "Refresh records"}
								className="px-2"
								isRefreshing={page.isRefreshing}
								onClick={hasActiveFilters ? page.resetFilters : page.refreshRecords}
							/>
						</div>
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
