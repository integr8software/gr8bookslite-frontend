"use client";

import { Search } from "lucide-react";
import { UnitOfMeasurementPaginationStorageKey } from "@/app/src/constants/modules/item-management/unit-of-measurement/UnitOfMeasurementConstants";
import { getUnitOfMeasurementTableMinWidthClassName } from "@/app/src/data/modules/item-management/unit-of-measurement/UnitOfMeasurementData";
import type { UnitOfMeasurementTableProps } from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { UnitOfMeasurementTableFilters } from "@/app/src/ui/modules/item-management/unit-of-measurement/UnitOfMeasurementTableFilters";
import { UnitOfMeasurementTableRow } from "@/app/src/ui/modules/item-management/unit-of-measurement/UnitOfMeasurementTableRow";

export function UnitOfMeasurementTable({
	filteredRecords,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	isSyncing,
	lastSyncedAt,
	permissions,
	quantityModeFilter,
	query,
	records,
	statusFilter,
	table,
	onEditRecord,
	onQuantityModeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onToggleStatus,
	onViewRecord,
}: UnitOfMeasurementTableProps) {
	const tableMinWidthClassName = getUnitOfMeasurementTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a unit of measurement to start maintaining quantity setup."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No unit of measurement records found"
				isLoading={isLoading}
				isSyncing={isSyncing}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={UnitOfMeasurementPaginationStorageKey}
				table={table}
				tableTitle="Unit Of Measurement"
				toolbar={
					<UnitOfMeasurementTableFilters
						exportAllRows={records}
						exportFilteredRows={filteredRecords}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						quantityModeFilter={quantityModeFilter}
						query={query}
						statusFilter={statusFilter}
						table={table}
						onQuantityModeFilterChange={onQuantityModeFilterChange}
						onQueryChange={onQueryChange}
						onRefresh={onRefresh}
						onStatusFilterChange={onStatusFilterChange}
					/>
				}
				renderRow={(row) => (
					<UnitOfMeasurementTableRow
						key={row.id}
						row={row}
						permissions={permissions}
						onEdit={onEditRecord}
						onToggleStatus={onToggleStatus}
						onView={onViewRecord}
					/>
				)}
			/>
		</div>
	);
}
