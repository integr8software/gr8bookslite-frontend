"use client";

import { Puzzle } from "lucide-react";
import {
	MasterAddOnPaginationStorageKey,
	MasterAddOnStatusFilterOptions,
	MasterAddOnTableColumns,
	type MasterAddOnStatusFilterValue,
} from "@/app/src/constants/master/add-ons/MasterAddOnConstants";
import type { useMasterAddOnListPage } from "@/app/src/hooks/master/add-ons/useMasterAddOnListPage";
import type { MasterAddOnRecord } from "@/app/src/types/master/add-ons/MasterAddOnTypes";
import { MasterAddOnTableRow } from "@/app/src/ui/master/add-ons/MasterAddOnTableRow";
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

type MasterAddOnTableProps = Pick<
	ReturnType<typeof useMasterAddOnListPage>,
	| "isLoading"
	| "isRefreshing"
	| "lastSyncedAt"
	| "query"
	| "records"
	| "filteredRecords"
	| "hasActiveFilters"
	| "resetFilters"
	| "setQuery"
	| "setStatusFilter"
	| "statusFilter"
	| "table"
	| "toggleRecordStatus"
>;

export function MasterAddOnTable({
	filteredRecords,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	query,
	records,
	resetFilters,
	setQuery,
	setStatusFilter,
	statusFilter,
	table,
	toggleRecordStatus,
}: MasterAddOnTableProps) {
	return (
		<ModuleTable<MasterAddOnRecord>
			emptyDescription="Try a different name, status, or pricing search."
			emptyIcon={<Puzzle className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No add-ons found"
			isLoading={isLoading}
			isSyncing={isRefreshing}
			lastSyncedAt={lastSyncedAt}
			minWidthClassName="min-w-[82rem]"
			paginationStorageKey={MasterAddOnPaginationStorageKey}
			table={table}
			tableTitle="Add-on records"
			toolbar={
				<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
					<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(9rem,0.8fr)]">
						<ModuleTableSearch
							label="Search add-ons"
							value={query}
							onChange={setQuery}
							placeholder="Search add-ons, pricing, or status"
						/>
						<ModuleTableFilterSelect
							label="Status"
							options={MasterAddOnStatusFilterOptions}
							value={statusFilter}
							onChange={(value) =>
								setStatusFilter(
									value as MasterAddOnStatusFilterValue,
								)
							}
						/>
					</div>
					<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
						<ModuleTableColumnVisibilityButton table={table} />
						<ModuleTableExportButton
							allRows={records}
							columns={MasterAddOnExportColumns}
							fileName="add-ons"
							filteredRows={filteredRecords}
							isFiltered={hasActiveFilters}
							table={table}
							title="Add-Ons"
						/>
						<ModuleTableResetButton
							className="px-2"
							onClick={resetFilters}
						>
							Reset
						</ModuleTableResetButton>
					</div>
				</ModuleTableToolbar>
			}
			renderRow={(row) => (
				<MasterAddOnTableRow
					key={row.id}
					row={row}
					onToggleStatus={toggleRecordStatus}
				/>
			)}
		/>
	);
}

const MasterAddOnExportColumns: ModuleTableExportColumn<MasterAddOnRecord>[] = [
	...MasterAddOnTableColumns.flatMap((column) =>
		"key" in column && column.key !== "modules"
			? [
					{
						header: column.label,
						id: column.key,
						value: getMasterAddOnExportValue(column.key),
					},
				]
			: [],
	),
	{
		header: "Modules",
		id: "modules",
		value: (record: MasterAddOnRecord) =>
			`${record.featureIds.length} module(s)`,
	},
	{ header: "Code", id: "code", value: "code" },
	{ header: "Description", id: "description", value: "description" },
];

function getMasterAddOnExportValue(
	key: keyof Pick<
		MasterAddOnRecord,
		"name" | "status" | "pricing"
	>,
): ModuleTableExportColumn<MasterAddOnRecord>["value"] {
	if (key === "pricing") {
		return (record) =>
			`PHP ${record.pricing.monthlyPrice.toFixed(2)} / month | PHP ${record.pricing.yearlyPrice.toFixed(2)} / year`;
	}

	return key;
}
