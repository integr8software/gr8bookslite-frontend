"use client";

import { Layers3 } from "lucide-react";
import type { useMasterModuleSystemListPage } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemListPage";
import type { MasterModuleSystem } from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import { MasterModuleSystemTableRow } from "@/app/src/ui/master/module-systems/MasterModuleSystemTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	type ModuleTableExportColumn,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

const StatusOptions = [
	{ label: "All statuses", value: "ALL" },
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
];

type MasterModuleSystemTableProps = Pick<
	ReturnType<typeof useMasterModuleSystemListPage>,
	| "isLoading"
	| "isRefreshing"
	| "lastSyncedAt"
	| "query"
	| "records"
	| "refreshSystems"
	| "resetFilters"
	| "setQuery"
	| "setStatusFilter"
	| "statusFilter"
	| "table"
	| "toggleRecordStatus"
>;

export function MasterModuleSystemTable({
	isLoading,
	isRefreshing,
	lastSyncedAt,
	query,
	records,
	refreshSystems,
	resetFilters,
	setQuery,
	setStatusFilter,
	statusFilter,
	table,
	toggleRecordStatus,
}: MasterModuleSystemTableProps) {
	const filteredRecords = table
		.getPrePaginationRowModel()
		.rows.map((row) => row.original);
	const hasActiveFilters = query.trim() !== "" || statusFilter !== "ALL";

	return (
		<ModuleTable<MasterModuleSystem>
			emptyDescription="Try a different system name, code, module count, or status."
			emptyIcon={<Layers3 className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No module systems found"
			isLoading={isLoading}
			isSyncing={isRefreshing}
			lastSyncedAt={lastSyncedAt}
			minWidthClassName="min-w-[68rem]"
			pageSizeOptions={[10, 25, 50]}
			paginationLabel="systems"
			paginationStorageKey="master-module-systems-v2"
			table={table}
			tableTitle="System records"
			toolbar={
				<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
					<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(9rem,0.8fr)]">
						<ModuleTableSearch
							label="Search systems"
							value={query}
							onChange={setQuery}
							placeholder="Search system name, code, or modules"
						/>
						<ModuleTableFilterSelect
							label="Status"
							options={StatusOptions}
							value={statusFilter}
							onChange={(value) => setStatusFilter(value as typeof statusFilter)}
						/>
					</div>
					<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
						<ModuleTableColumnVisibilityButton table={table} />
						<ModuleTableExportButton
							allRows={records}
							columns={MasterModuleSystemExportColumns}
							fileName="master-module-systems"
							filteredRows={filteredRecords}
							isFiltered={hasActiveFilters}
							table={table}
							title="Master Module Systems"
						/>
						<ModuleTableResetButton
							className="px-2"
							isRefreshing={isRefreshing}
							onClick={() => {
								resetFilters();
								refreshSystems();
							}}
						>
							Refresh
						</ModuleTableResetButton>
					</div>
				</ModuleTableToolbar>
			}
			renderRow={(row) => (
				<MasterModuleSystemTableRow
					key={row.id}
					row={row}
					onToggleStatus={toggleRecordStatus}
				/>
			)}
		/>
	);
}

const MasterModuleSystemExportColumns: ModuleTableExportColumn<MasterModuleSystem>[] =
	[
		{ header: "System Name", id: "name", value: "name" },
		{ header: "Description", id: "description", value: "description" },
		{ header: "Modules", id: "modules", value: "moduleCount" },
		{
			header: "Status",
			id: "isActive",
			value: (record) => (record.isActive ? "Active" : "Inactive"),
		},
	];
