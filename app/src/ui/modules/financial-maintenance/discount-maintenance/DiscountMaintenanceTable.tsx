"use client";

import { Search } from "lucide-react";
import { DiscountMaintenanceTablePaginationStorageKey } from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import {
	createDiscountMaintenanceTableRecord,
	getDiscountMaintenanceTableMinWidthClassName,
} from "@/app/src/data/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceData";
import { useDiscountMaintenanceTable } from "@/app/src/hooks/modules/financial-maintenance/discount-maintenance/useDiscountMaintenanceTable";
import type {
	DiscountMaintenanceTableProps,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { DiscountMaintenanceTableFilters } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTableFilters";
import { DiscountMaintenanceTableRow } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTableRow";

export function DiscountMaintenanceTable({
	discountTypeFilter,
	filteredDiscounts,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	permissions,
	query,
	statusFilter,
	tableTypeFilter,
	discounts,
	onDiscountTypeFilterChange,
	onEditDiscount,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onToggleStatus,
	onTypeFilterChange,
	onViewDiscount,
}: DiscountMaintenanceTableProps) {
	const table = useDiscountMaintenanceTable(filteredDiscounts);
	const exportAllRows = discounts.map(createDiscountMaintenanceTableRecord);
	const exportFilteredRows = filteredDiscounts.map(
		createDiscountMaintenanceTableRecord,
	);
	const tableMinWidthClassName = getDiscountMaintenanceTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a discount to start mapping purchase and sales discounts to accounts."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Discount Records Found"
				isLoading={isLoading}
				isSyncing={isRefreshing}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={DiscountMaintenanceTablePaginationStorageKey}
				lastSyncedAt={lastSyncedAt}
				table={table}
				tableTitle="Discount Definitions"
				toolbar={
					<DiscountMaintenanceTableFilters
						discountTypeFilter={discountTypeFilter}
						exportAllRows={exportAllRows}
						exportFilteredRows={exportFilteredRows}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						query={query}
						statusFilter={statusFilter}
						table={table}
						typeFilter={tableTypeFilter}
						onDiscountTypeFilterChange={onDiscountTypeFilterChange}
						onQueryChange={onQueryChange}
						onRefresh={onRefresh}
						onStatusFilterChange={onStatusFilterChange}
						onTypeFilterChange={onTypeFilterChange}
					/>
				}
				renderRow={(row) => (
					<DiscountMaintenanceTableRow
						key={row.id}
						discount={row.original}
						permissions={permissions}
						row={row}
						onEditDiscount={onEditDiscount}
						onToggleStatus={onToggleStatus}
						onViewDiscount={onViewDiscount}
					/>
				)}
			/>
		</div>
	);
}


