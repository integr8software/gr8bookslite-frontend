"use client";

import { Search } from "lucide-react";
import { AuditTrailPaginationStorageKey } from "@/app/src/constants/modules/system-administration/audit-trail/AuditTrailConstants";
import type { useAuditTrailListPage } from "@/app/src/hooks/modules/system-administration/audit-trail/useAuditTrailListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { AuditTrailTableFilters } from "@/app/src/ui/modules/system-administration/audit-trail/AuditTrailTableFilters";
import { AuditTrailTableRow } from "@/app/src/ui/modules/system-administration/audit-trail/AuditTrailTableRow";

type AuditTrailTableProps = Pick<
	ReturnType<typeof useAuditTrailListPage>,
	| "actionFilter"
	| "dateRangeFilter"
	| "handleActionFilterChange"
	| "handleDateRangeFilterChange"
	| "handleModuleFilterChange"
	| "handleQueryChange"
	| "isLoading"
	| "moduleFilter"
	| "moduleOptions"
	| "query"
	| "table"
>;

export function AuditTrailTable({
	actionFilter,
	dateRangeFilter,
	handleActionFilterChange,
	handleDateRangeFilterChange,
	handleModuleFilterChange,
	handleQueryChange,
	isLoading,
	moduleFilter,
	moduleOptions,
	query,
	table,
}: AuditTrailTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Adjust filters to review activity across sidebar modules."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No audit trail records found"
				isLoading={isLoading}
				minWidthClassName="min-w-[90rem]"
				pageSizeOptions={[10, 20, 50]}
				paginationStorageKey={AuditTrailPaginationStorageKey}
				table={table}
				toolbar={
					<AuditTrailTableFilters
						actionFilter={actionFilter}
						dateRangeFilter={dateRangeFilter}
						moduleFilter={moduleFilter}
						moduleOptions={moduleOptions}
						query={query}
						onActionFilterChange={handleActionFilterChange}
						onDateRangeFilterChange={handleDateRangeFilterChange}
						onModuleFilterChange={handleModuleFilterChange}
						onQueryChange={handleQueryChange}
					/>
				}
				renderRow={({ id, original }) => (
					<AuditTrailTableRow key={id} record={original} />
				)}
			/>
		</div>
	);
}
