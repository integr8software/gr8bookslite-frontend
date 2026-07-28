"use client";

import { Search } from "lucide-react";
import { TermsMaintenanceTablePaginationStorageKey } from "@/app/src/constants/modules/financial-maintenance/terms-maintenance/TermsMaintenanceConstants";
import { getTermsMaintenanceTableMinWidthClassName } from "@/app/src/data/modules/financial-maintenance/terms-maintenance/TermsMaintenanceData";
import { useTermsMaintenanceTable } from "@/app/src/hooks/modules/financial-maintenance/terms-maintenance/useTermsMaintenanceTable";
import type {
	TermsMaintenanceTableProps,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TermsMaintenanceTableFilters } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTableFilters";
import { TermsMaintenanceTableRow } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTableRow";

export function TermsMaintenanceTable({
	datemodeFilter,
	filteredTerms,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	query,
	statusFilter,
	terms,
	permissions,
	onDatemodeFilterChange,
	onEditTerm,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onToggleStatus,
	onViewTerm,
}: TermsMaintenanceTableProps) {
	const table = useTermsMaintenanceTable(filteredTerms);
	const tableMinWidthClassName = getTermsMaintenanceTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a term definition to start managing reporting and payment cycles."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Term Records Found"
				isLoading={isLoading}
				isSyncing={isRefreshing}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={TermsMaintenanceTablePaginationStorageKey}
				table={table}
				tableTitle="Term Definitions"
				toolbar={
					<TermsMaintenanceTableFilters
						datemodeFilter={datemodeFilter}
						exportAllRows={terms}
						exportFilteredRows={filteredTerms}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						query={query}
						statusFilter={statusFilter}
						table={table}
						onDatemodeFilterChange={onDatemodeFilterChange}
						onQueryChange={onQueryChange}
						onRefresh={onRefresh}
						onStatusFilterChange={onStatusFilterChange}
					/>
				}
				renderRow={(row) => (
					<TermsMaintenanceTableRow
						key={row.id}
						row={row}
						permissions={permissions}
						onEditTerm={onEditTerm}
						onToggleStatus={onToggleStatus}
						onViewTerm={onViewTerm}
					/>
				)}
			/>
		</div>
	);
}


