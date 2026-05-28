"use client";

import { Package } from "lucide-react";
import {
	MasterPlanAndPackagePaginationStorageKey,
	MasterPlanAndPackageScopeFilterOptions,
	MasterPlanAndPackageStatusFilterOptions,
	type MasterPlanAndPackageScopeFilterValue,
	type MasterPlanAndPackageStatusFilterValue,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type { useMasterPlanAndPackageListPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageListPage";
import type { MasterPlanAndPackageRecord } from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import { MasterPlanAndPackageTableRow } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

type MasterPlanAndPackageTableProps = Pick<
	ReturnType<typeof useMasterPlanAndPackageListPage>,
	| "isLoading"
	| "query"
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
	isLoading,
	query,
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
			minWidthClassName="min-w-[82rem]"
			paginationStorageKey={MasterPlanAndPackagePaginationStorageKey}
			table={table}
			toolbar={
				<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.4fr)_minmax(12rem,1fr)_minmax(13rem,1fr)_minmax(9rem,0.6fr)]">
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
							setStatusFilter(value as MasterPlanAndPackageStatusFilterValue)
						}
					/>
					<ModuleTableFilterSelect
						label="Scope"
						options={MasterPlanAndPackageScopeFilterOptions}
						value={scopeFilter}
						onChange={(value) =>
							setScopeFilter(value as MasterPlanAndPackageScopeFilterValue)
						}
					/>
					<ModuleTableResetButton onClick={resetFilters}>
						Reset
					</ModuleTableResetButton>
				</ModuleTableToolbar>
			}
			renderRow={(row) => (
				<MasterPlanAndPackageTableRow
					key={row.id}
					record={row.original}
					onToggleStatus={toggleRecordStatus}
				/>
			)}
		/>
	);
}
