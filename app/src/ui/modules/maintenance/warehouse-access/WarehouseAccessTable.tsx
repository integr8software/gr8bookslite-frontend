"use client";

import { Search } from "lucide-react";
import {
	getWarehouseAccessTableMinWidthClassName,
	WarehouseAccessExportColumns,
	WarehouseAccessPaginationStorageKey,
} from "@/app/src/constants/modules/maintenance/warehouse-access/WarehouseAccessConstants";
import type { WarehouseAccessTableProps } from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WarehouseAccessTableRow } from "@/app/src/ui/modules/maintenance/warehouse-access/WarehouseAccessTableRow";

export function WarehouseAccessTable({
	hasActiveFilters,
	page,
}: WarehouseAccessTableProps) {
	const tableMinWidthClassName = getWarehouseAccessTableMinWidthClassName(
		page.table.getVisibleLeafColumns().length,
	);

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
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={WarehouseAccessPaginationStorageKey}
				table={page.table}
				tableTitle="Warehouse Access Assignments"
				toolbar={
					<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
						<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)]">
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
						</div>
						<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
							<ModuleTableColumnVisibilityButton table={page.table} />
							<ModuleTableExportButton
								allRows={page.records}
								columns={WarehouseAccessExportColumns}
								fileName="warehouse-access"
								filteredRows={page.filteredRecords}
								isFiltered={hasActiveFilters}
								table={page.table}
								title="Warehouse Access"
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
