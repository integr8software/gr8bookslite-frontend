"use client";

import { Search } from "lucide-react";
import { ResponsibilityCenterTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { getResponsibilityCenterTableMinWidthClassName } from "@/app/src/data/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterData";
import { useResponsibilityCenterTable } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenterTable";
import type { ResponsibilityCenterTableProps } from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ResponsibilityCenterTableFilters } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTableFilters";
import { ResponsibilityCenterTableRow } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTableRow";

export function ResponsibilityCenterTable({
	categoryFilter,
	centers,
	filteredCenters,
	financialTypeFilter,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	permissions,
	query,
	statusFilter,
	onCategoryFilterChange,
	onEditCenter,
	onFinancialTypeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onToggleStatus,
	onViewCenter,
}: ResponsibilityCenterTableProps) {
	const table = useResponsibilityCenterTable(filteredCenters);
	const tableMinWidthClassName = getResponsibilityCenterTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a center to start grouping financial accountability."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Responsibility Center Records Found"
				isLoading={isLoading}
				isSyncing={isRefreshing}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={ResponsibilityCenterTablePaginationStorageKey}
				table={table}
				tableTitle="Responsibility centers"
				toolbar={
					<ResponsibilityCenterTableFilters
						categoryFilter={categoryFilter}
						exportAllRows={centers}
						exportFilteredRows={filteredCenters}
						financialTypeFilter={financialTypeFilter}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						query={query}
						statusFilter={statusFilter}
						table={table}
						onCategoryFilterChange={onCategoryFilterChange}
						onFinancialTypeFilterChange={onFinancialTypeFilterChange}
						onQueryChange={onQueryChange}
						onRefresh={onRefresh}
						onStatusFilterChange={onStatusFilterChange}
					/>
				}
				renderRow={(row) => (
					<ResponsibilityCenterTableRow
						key={row.id}
						allCenters={centers}
						permissions={permissions}
						row={row}
						onEditCenter={onEditCenter}
						onToggleStatus={onToggleStatus}
						onViewCenter={onViewCenter}
					/>
				)}
			/>
		</div>
	);
}
