"use client";

import { Package } from "lucide-react";
import { MasterPlanAndPackagePaginationStorageKey } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type { useMasterPlanAndPackageListPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageListPage";
import type { MasterPlanAndPackageRecord } from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import { MasterPlanAndPackageTableRow } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

type MasterPlanAndPackageTableProps = Pick<
	ReturnType<typeof useMasterPlanAndPackageListPage>,
	"query" | "resetFilters" | "setQuery" | "table" | "toggleRecordStatus"
>;

export function MasterPlanAndPackageTable({
	query,
	resetFilters,
	setQuery,
	table,
	toggleRecordStatus,
}: MasterPlanAndPackageTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<MasterPlanAndPackageRecord>
				emptyDescription="Try a different plan name, pricing model, status, or user rule."
				emptyIcon={<Package className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No plans found"
				minWidthClassName="min-w-[82rem]"
				paginationStorageKey={MasterPlanAndPackagePaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,3fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search plans"
							value={query}
							onChange={setQuery}
							placeholder="Search plans, pricing, users, or status"
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
		</div>
	);
}

