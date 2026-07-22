"use client";

import { Search } from "lucide-react";
import { TermManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/term-management/TermManagementConstants";
import { getTermManagementTableMinWidthClassName } from "@/app/src/data/modules/maintenance/term-management/TermManagementData";
import { useTermManagementTable } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagementTable";
import type {
	TermManagementTableProps,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TermManagementTableFilters } from "@/app/src/ui/modules/maintenance/term-management/TermManagementTableFilters";
import { TermManagementTableRow } from "@/app/src/ui/modules/maintenance/term-management/TermManagementTableRow";

export function TermManagementTable({
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
}: TermManagementTableProps) {
	const table = useTermManagementTable(filteredTerms);
	const tableMinWidthClassName = getTermManagementTableMinWidthClassName(
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
				paginationStorageKey={TermManagementTablePaginationStorageKey}
				table={table}
				tableTitle="Term Definitions"
				toolbar={
					<TermManagementTableFilters
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
					<TermManagementTableRow
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


