"use client";

import { Search } from "lucide-react";
import { ResponsibilityCenterTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/responsibility-center/ResponsibilityCenterConstants";
import { getResponsibilityCenterTableMinWidthClassName } from "@/app/src/data/modules/maintenance/responsibility-center/ResponsibilityCenterData";
import { useResponsibilityCenterTable } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenterTable";
import type { ResponsibilityCenterTableProps } from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ResponsibilityCenterTableFilters } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTableFilters";
import { ResponsibilityCenterTableRow } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTableRow";
import { ResponsibilityCenterTree } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTree";

export function ResponsibilityCenterTable(props: ResponsibilityCenterTableProps) {
	const {
		categoryFilter,
		centers,
		expandedTreeIds,
		filteredCenters,
		financialTypeFilter,
		hasActiveFilters,
		isLoading,
		isRefreshing,
		lastSyncedAt,
		permissions,
		query,
		statusFilter,
		treeTable,
		viewMode,
		onCategoryFilterChange,
		onEditCenter,
		onFinancialTypeFilterChange,
		onQueryChange,
		onRefresh,
		onStatusFilterChange,
		onToggleStatus,
		onToggleTreeNode,
		onViewCenter,
		onViewModeChange,
	} = props;
	const toolbar = (
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
			table={treeTable}
			viewMode={viewMode}
			onCategoryFilterChange={onCategoryFilterChange}
			onFinancialTypeFilterChange={onFinancialTypeFilterChange}
			onQueryChange={onQueryChange}
			onRefresh={onRefresh}
			onStatusFilterChange={onStatusFilterChange}
			onViewModeChange={onViewModeChange}
		/>
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			{viewMode === "tree" ? (
				<ResponsibilityCenterTree
					expandedIds={expandedTreeIds}
					isLoading={isLoading}
					isRefreshing={isRefreshing}
					lastSyncedAt={lastSyncedAt}
					permissions={permissions}
					table={treeTable}
					toolbar={toolbar}
					onEditCenter={onEditCenter}
					onToggleStatus={onToggleStatus}
					onToggleTreeNode={onToggleTreeNode}
					onViewCenter={onViewCenter}
				/>
			) : (
				<ResponsibilityCenterListModeTable {...props} />
			)}
		</div>
	);
}

function ResponsibilityCenterListModeTable({
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
	tablePreferences,
	onCategoryFilterChange,
	onEditCenter,
	onFinancialTypeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onToggleStatus,
	onViewCenter,
	onViewModeChange,
}: ResponsibilityCenterTableProps) {
	const table = useResponsibilityCenterTable(filteredCenters, tablePreferences);
	const tableMinWidthClassName = getResponsibilityCenterTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);
	const toolbar = (
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
			viewMode="list"
			onCategoryFilterChange={onCategoryFilterChange}
			onFinancialTypeFilterChange={onFinancialTypeFilterChange}
			onQueryChange={onQueryChange}
			onRefresh={onRefresh}
			onStatusFilterChange={onStatusFilterChange}
			onViewModeChange={onViewModeChange}
		/>
	);

	return (
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
			toolbar={toolbar}
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
	);
}


