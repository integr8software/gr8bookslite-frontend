"use client";

import { Search } from "lucide-react";
import {
	WorkspaceAuditLogActionOptions,
	WorkspaceAuditLogDateRangeOptions,
	WorkspaceAuditLogPaginationStorageKey,
	WorkspaceAuditLogSeverityOptions,
} from "@/app/src/constants/workspace/audit-logs/WorkspaceAuditLogConstants";
import type { useWorkspaceAuditLogListPage } from "@/app/src/hooks/workspace/audit-logs/useWorkspaceAuditLogListPage";
import type {
	WorkspaceAuditLogAction,
	WorkspaceAuditLogDateRange,
	WorkspaceAuditLogRecord,
	WorkspaceAuditLogSeverity,
} from "@/app/src/types/workspace/audit-logs/WorkspaceAuditLogTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WorkspaceAuditLogTableRow } from "@/app/src/ui/workspace/audit-logs/WorkspaceAuditLogTableRow";

type WorkspaceAuditLogTableProps = Pick<
	ReturnType<typeof useWorkspaceAuditLogListPage>,
	| "actionFilter"
	| "branchFilter"
	| "branchOptions"
	| "dateRangeFilter"
	| "isError"
	| "isLoading"
	| "moduleFilter"
	| "moduleOptions"
	| "query"
	| "resetFilters"
	| "setActionFilter"
	| "setBranchFilter"
	| "setDateRangeFilter"
	| "setModuleFilter"
	| "setQuery"
	| "setSeverityFilter"
	| "severityFilter"
	| "table"
>;

export function WorkspaceAuditLogTable({
	actionFilter,
	branchFilter,
	branchOptions,
	dateRangeFilter,
	isError,
	isLoading,
	moduleFilter,
	moduleOptions,
	query,
	resetFilters,
	setActionFilter,
	setBranchFilter,
	setDateRangeFilter,
	setModuleFilter,
	setQuery,
	setSeverityFilter,
	severityFilter,
	table,
}: WorkspaceAuditLogTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<WorkspaceAuditLogRecord>
				variant="embedded"
				emptyDescription={
					isError
						? "The audit log service could not be reached. Refresh the page or try again."
						: "Adjust branch, date range, module, action, or severity."
				}
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle={
					isError ? "Could not load audit logs" : "No audit logs found"
				}
				isLoading={isLoading}
				minWidthClassName="min-w-[106rem]"
				paginationLabel="logs"
				paginationStorageKey={WorkspaceAuditLogPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(24rem,2.4fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(9rem,0.7fr)]">
						<ModuleTableSearch
							label="Search workspace audit logs"
							value={query}
							onChange={setQuery}
							placeholder="Search module, user, record, or branch"
						/>
						<ModuleTableFilterSelect
							label="Branch"
							value={branchFilter}
							options={[
								{ label: "All branches", value: "all" },
								...branchOptions.map((branch) => ({
									label: branch.name,
									value: branch.id,
								})),
							]}
							onChange={setBranchFilter}
						/>
						<ModuleTableFilterSelect
							label="Date"
							value={dateRangeFilter}
							options={WorkspaceAuditLogDateRangeOptions}
							onChange={(value) =>
								setDateRangeFilter(value as WorkspaceAuditLogDateRange)
							}
						/>
						<ModuleTableFilterSelect
							label="Module"
							value={moduleFilter}
							options={[
								{ label: "All modules", value: "all" },
								...moduleOptions.map((module) => ({
									label: module,
									value: module,
								})),
							]}
							onChange={setModuleFilter}
						/>
						<ModuleTableFilterSelect
							label="Action"
							value={actionFilter}
							options={[
								{ label: "All actions", value: "all" },
								...WorkspaceAuditLogActionOptions.map((action) => ({
									label: action,
									value: action,
								})),
							]}
							onChange={(value) =>
								setActionFilter(value as WorkspaceAuditLogAction | "all")
							}
						/>
						<ModuleTableFilterSelect
							label="Severity"
							value={severityFilter}
							options={[
								{ label: "All severities", value: "all" },
								...WorkspaceAuditLogSeverityOptions.map((severity) => ({
									label: severity,
									value: severity,
								})),
							]}
							onChange={(value) =>
								setSeverityFilter(value as WorkspaceAuditLogSeverity | "all")
							}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<WorkspaceAuditLogTableRow key={row.id} record={row.original} />
				)}
			/>
		</div>
	);
}
