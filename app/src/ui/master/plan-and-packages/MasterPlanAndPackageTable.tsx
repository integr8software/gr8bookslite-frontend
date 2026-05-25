"use client";

import { Package, Search, X } from "lucide-react";
import { MasterPlanAndPackagePaginationStorageKey } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type { useMasterPlanAndPackageListPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageListPage";
import type { MasterPlanAndPackageRecord } from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import { MasterPlanAndPackageTableRow } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

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
			<div className="grid gap-3 border-b border-darknavy/10 p-4 lg:grid-cols-[1fr_auto]">
				<label className="relative block">
					<span className="sr-only">Search plans</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40"
						aria-hidden="true"
					/>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search plans, pricing, users, or status"
						className="h-11 w-full rounded-lg border border-darknavy/10 bg-white pl-11 pr-4 text-sm text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
					/>
				</label>
				<button
					type="button"
					onClick={resetFilters}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/65 shadow-sm transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Reset
				</button>
			</div>
			<ModuleTable<MasterPlanAndPackageRecord>
				emptyDescription="Try a different plan name, pricing model, status, or user rule."
				emptyIcon={<Package className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No plans found"
				minWidthClassName="min-w-[82rem]"
				paginationStorageKey={MasterPlanAndPackagePaginationStorageKey}
				table={table}
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
