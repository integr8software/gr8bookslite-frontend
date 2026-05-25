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
	| "handleActionFilterChange"
	| "handleModuleFilterChange"
	| "handleQueryChange"
	| "handleSeverityFilterChange"
	| "isLoading"
	| "moduleFilter"
	| "moduleOptions"
	| "query"
	| "severityFilter"
	| "table"
>;

export function AuditTrailTable({
	actionFilter,
	handleActionFilterChange,
	handleModuleFilterChange,
	handleQueryChange,
	handleSeverityFilterChange,
	isLoading,
	moduleFilter,
	moduleOptions,
	query,
	severityFilter,
	table,
}: AuditTrailTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<AuditTrailTableFilters
				actionFilter={actionFilter}
				moduleFilter={moduleFilter}
				moduleOptions={moduleOptions}
				query={query}
				severityFilter={severityFilter}
				onActionFilterChange={handleActionFilterChange}
				onModuleFilterChange={handleModuleFilterChange}
				onQueryChange={handleQueryChange}
				onSeverityFilterChange={handleSeverityFilterChange}
			/>
			<ModuleTable
				emptyDescription="Adjust filters to review activity across sidebar modules."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No audit trail records found"
				isLoading={isLoading}
				minWidthClassName="min-w-[92rem]"
				pageSizeOptions={[10, 20, 50]}
				paginationStorageKey={AuditTrailPaginationStorageKey}
				table={table}
				renderRow={({ id, original }) => (
					<AuditTrailTableRow key={id} record={original} />
				)}
			/>
		</div>
	);
}
