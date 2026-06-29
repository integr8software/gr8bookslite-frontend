"use client";

import { Package } from "lucide-react";
import {
	MasterPlanAndPackagePaginationStorageKey,
	MasterPlanAndPackageScopeFilterOptions,
	MasterPlanAndPackageStatusFilterOptions,
	MasterPlanAndPackageTableColumns,
	type MasterPlanAndPackageScopeFilterValue,
	type MasterPlanAndPackageStatusFilterValue,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type { useMasterPlanAndPackageListPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageListPage";
import type { MasterPlanAndPackageRecord } from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import { MasterPlanAndPackageTableRow } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageTableRow";
import {
	formatMasterPlanAndPackagePricing,
	formatMasterPlanAndPackageScalePricing,
	formatMasterPlanAndPackageScope,
} from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";
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

type MasterPlanAndPackageTableProps = Pick<
	ReturnType<typeof useMasterPlanAndPackageListPage>,
	| "isLoading"
	| "isRefreshing"
	| "lastSyncedAt"
	| "query"
	| "records"
	| "filteredRecords"
	| "hasActiveFilters"
	| "resetFilters"
	| "scopeFilter"
	| "setQuery"
	| "setScopeFilter"
	| "setStatusFilter"
	| "statusFilter"
	| "table"
	| "toggleRecordStatus"
>;

export function MasterPlanAndPackageTable({
	filteredRecords,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	query,
	records,
	resetFilters,
	scopeFilter,
	setQuery,
	setScopeFilter,
	setStatusFilter,
	statusFilter,
	table,
	toggleRecordStatus,
}: MasterPlanAndPackageTableProps) {
	return (
		<ModuleTable<MasterPlanAndPackageRecord>
			emptyDescription="Try a different plan name, pricing model, status, or user rule."
			emptyIcon={<Package className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No plans found"
			isLoading={isLoading}
			isSyncing={isRefreshing}
			lastSyncedAt={lastSyncedAt}
			minWidthClassName="min-w-[82rem]"
			paginationStorageKey={MasterPlanAndPackagePaginationStorageKey}
			table={table}
			tableTitle="Plan records"
			toolbar={
				<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
					<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(9rem,0.8fr)_minmax(10rem,0.9fr)]">
						<ModuleTableSearch
							label="Search plans"
							value={query}
							onChange={setQuery}
							placeholder="Search plans, pricing, users, or status"
						/>
						<ModuleTableFilterSelect
							label="Status"
							options={MasterPlanAndPackageStatusFilterOptions}
							value={statusFilter}
							onChange={(value) =>
								setStatusFilter(
									value as MasterPlanAndPackageStatusFilterValue,
								)
							}
						/>
						<ModuleTableFilterSelect
							label="Scope"
							options={MasterPlanAndPackageScopeFilterOptions}
							value={scopeFilter}
							onChange={(value) =>
								setScopeFilter(
									value as MasterPlanAndPackageScopeFilterValue,
								)
							}
						/>
					</div>
					<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
						<ModuleTableColumnVisibilityButton table={table} />
						<ModuleTableExportButton
							allRows={records}
							columns={MasterPlanAndPackageExportColumns}
							fileName="plan-and-packages"
							filteredRows={filteredRecords}
							isFiltered={hasActiveFilters}
							table={table}
							title="Plan and Packages"
						/>
						<ModuleTableResetButton className="px-2" onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</div>
				</ModuleTableToolbar>
			}
			renderRow={(row) => (
				<MasterPlanAndPackageTableRow
					key={row.id}
					row={row}
					onToggleStatus={toggleRecordStatus}
				/>
			)}
		/>
	);
}

const MasterPlanAndPackageExportColumns: ModuleTableExportColumn<MasterPlanAndPackageRecord>[] = [
	...MasterPlanAndPackageTableColumns.flatMap((column) =>
		"key" in column
			? [
					{
						header: column.label,
						id: column.key,
						value: getMasterPlanAndPackageExportValue(column.key),
					},
				]
			: [],
	),
	{ header: "Code", id: "code", value: "code" },
	{ header: "Description", id: "description", value: "description" },
	{
		header: "Scope",
		id: "scope",
		value: (record) => formatMasterPlanAndPackageScope(record.scope),
	},
	{ header: "Trial Days", id: "trialDays", value: "trialDays" },
];

function getMasterPlanAndPackageExportValue(
	key: keyof Pick<
		MasterPlanAndPackageRecord,
		"name" | "pricing" | "scalePricing" | "status"
	>,
): ModuleTableExportColumn<MasterPlanAndPackageRecord>["value"] {
	if (key === "pricing") {
		return (record) => formatMasterPlanAndPackagePricing(record.pricing);
	}

	if (key === "scalePricing") {
		return (record) =>
			formatMasterPlanAndPackageScalePricing(record.scalePricing);
	}

	return key;
}
