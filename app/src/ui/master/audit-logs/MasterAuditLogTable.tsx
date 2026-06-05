"use client";

import { Search } from "lucide-react";
import {
	MasterAuditLogActionOptions,
	MasterAuditLogDateRangeOptions,
	MasterAuditLogPaginationStorageKey,
	MasterAuditLogResultOptions,
} from "@/app/src/constants/master/audit-logs/MasterAuditLogConstants";
import type { useMasterAuditLogListPage } from "@/app/src/hooks/master/audit-logs/useMasterAuditLogListPage";
import type {
	MasterAuditLogAction,
	MasterAuditLogDateRange,
	MasterAuditLogRecord,
	MasterAuditLogResult,
} from "@/app/src/types/master/audit-logs/MasterAuditLogTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { MasterAuditLogTableRow } from "@/app/src/ui/master/audit-logs/MasterAuditLogTableRow";

type MasterAuditLogTableProps = Pick<
	ReturnType<typeof useMasterAuditLogListPage>,
	| "actionFilter"
	| "companyFilter"
	| "companyOptions"
	| "dateRangeFilter"
	| "moduleFilter"
	| "moduleOptions"
	| "query"
	| "resetFilters"
	| "resultFilter"
	| "setActionFilter"
	| "setCompanyFilter"
	| "setDateRangeFilter"
	| "setModuleFilter"
	| "setQuery"
	| "setResultFilter"
	| "table"
>;

export function MasterAuditLogTable({
	actionFilter,
	companyFilter,
	companyOptions,
	dateRangeFilter,
	moduleFilter,
	moduleOptions,
	query,
	resetFilters,
	resultFilter,
	setActionFilter,
	setCompanyFilter,
	setDateRangeFilter,
	setModuleFilter,
	setQuery,
	setResultFilter,
	table,
}: MasterAuditLogTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<MasterAuditLogRecord>
				variant="embedded"
				emptyDescription="Adjust the selected company, date range, module, action, or result."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No audit logs found"
				minWidthClassName="min-w-[131rem]"
				paginationLabel="logs"
				paginationStorageKey={MasterAuditLogPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(24rem,2.4fr)_minmax(13rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(13rem,1fr)_minmax(11rem,0.9fr)_minmax(9rem,0.7fr)]">
						<ModuleTableSearch
							label="Search audit logs"
							value={query}
							onChange={setQuery}
							placeholder="Search company, branch, module, result, user, record, or IP"
						/>
						<ModuleTableFilterSelect
							label="Company"
							value={companyFilter}
							options={[
								{ label: "All companies", value: "all" },
								...companyOptions.map((company) => ({
									label: company.name,
									value: company.id,
								})),
							]}
							onChange={setCompanyFilter}
						/>
						<ModuleTableFilterSelect
							label="Date"
							value={dateRangeFilter}
							options={MasterAuditLogDateRangeOptions}
							onChange={(value) =>
								setDateRangeFilter(value as MasterAuditLogDateRange)
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
								...MasterAuditLogActionOptions.map((action) => ({
									label: action,
									value: action,
								})),
							]}
							onChange={(value) =>
								setActionFilter(value as MasterAuditLogAction | "all")
							}
						/>
						<ModuleTableFilterSelect
							label="Result"
							value={resultFilter}
							options={[
								{ label: "All results", value: "all" },
								...MasterAuditLogResultOptions.map((result) => ({
									label: result,
									value: result,
								})),
							]}
							onChange={(value) =>
								setResultFilter(value as MasterAuditLogResult | "all")
							}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<MasterAuditLogTableRow key={row.id} record={row.original} />
				)}
			/>
		</div>
	);
}
