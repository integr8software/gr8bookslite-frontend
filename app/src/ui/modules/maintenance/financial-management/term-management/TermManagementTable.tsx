"use client";

import { Search } from "lucide-react";
import { TermManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementTable } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementTable";
import type { TermManagementPermissions } from "@/app/src/services/modules/maintenance/financial-management/term-management/TermManagementApi";
import type {
	TermManagement,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TermManagementTableFilters } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementTableFilters";
import { TermManagementTableRow } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementTableRow";

type TermManagementTableProps = {
	datemodeFilter: string;
	filteredTerms: TermManagement[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	query: string;
	statusFilter: "" | TermManagementStatus;
	terms: TermManagement[];
	permissions: TermManagementPermissions;
	onDatemodeFilterChange: (value: string) => void;
	onEditTerm: (term: TermManagement) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: "" | TermManagementStatus) => void;
	onToggleStatus: (term: TermManagement) => void;
	onViewTerm: (term: TermManagement) => void;
};

export function TermManagementTable({
	datemodeFilter,
	filteredTerms,
	hasActiveFilters,
	isLoading,
	isRefreshing,
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
	const tableMinWidthClassName = getTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a term definition to start managing reporting and payment cycles."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No term records found"
				isLoading={isLoading}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={TermManagementTablePaginationStorageKey}
				table={table}
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

function getTableMinWidthClassName(visibleColumnCount: number) {
	if (visibleColumnCount >= 10) return "min-w-[136rem]";
	if (visibleColumnCount === 9) return "min-w-[122rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[94rem]";
	if (visibleColumnCount === 6) return "min-w-[80rem]";
	return "min-w-[64rem]";
}
