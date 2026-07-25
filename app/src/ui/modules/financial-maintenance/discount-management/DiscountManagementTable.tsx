"use client";

import { Search } from "lucide-react";
import { DiscountManagementTablePaginationStorageKey } from "@/app/src/constants/modules/financial-maintenance/discount-management/DiscountManagementConstants";
import {
	createDiscountManagementTableRecord,
	getDiscountManagementTableMinWidthClassName,
} from "@/app/src/data/modules/financial-maintenance/discount-management/DiscountManagementData";
import { useDiscountManagementTable } from "@/app/src/hooks/modules/financial-maintenance/discount-management/useDiscountManagementTable";
import type {
	DiscountManagementTableProps,
} from "@/app/src/types/modules/financial-maintenance/discount-management/DiscountManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { DiscountManagementTableFilters } from "@/app/src/ui/modules/financial-maintenance/discount-management/DiscountManagementTableFilters";
import { DiscountManagementTableRow } from "@/app/src/ui/modules/financial-maintenance/discount-management/DiscountManagementTableRow";

export function DiscountManagementTable({
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
}: DiscountManagementTableProps) {
	const table = useDiscountManagementTable(filteredDiscounts);
	const exportAllRows = discounts.map(createDiscountManagementTableRecord);
	const exportFilteredRows = filteredDiscounts.map(
		createDiscountManagementTableRecord,
	);
	const tableMinWidthClassName = getDiscountManagementTableMinWidthClassName(
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
				paginationStorageKey={DiscountManagementTablePaginationStorageKey}
				lastSyncedAt={lastSyncedAt}
				table={table}
				tableTitle="Discount Definitions"
				toolbar={
					<DiscountManagementTableFilters
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
					<DiscountManagementTableRow
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


