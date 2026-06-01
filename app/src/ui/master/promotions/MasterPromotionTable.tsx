"use client";

import { Tags } from "lucide-react";
import {
	MasterPromotionPaginationStorageKey,
	MasterPromotionStatusFilterOptions,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import type {
	MasterPromotionStatusFilter,
	useMasterPromotionListPage,
} from "@/app/src/hooks/master/promotions/useMasterPromotionListPage";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { MasterPromotionTableRow } from "@/app/src/ui/master/promotions/MasterPromotionTableRow";

type MasterPromotionTableProps = Pick<
	ReturnType<typeof useMasterPromotionListPage>,
	| "query"
	| "resetFilters"
	| "setPendingDeleteRecord"
	| "setQuery"
	| "setStatusFilter"
	| "statusFilter"
	| "table"
>;

export function MasterPromotionTable({
	query,
	resetFilters,
	setPendingDeleteRecord,
	setQuery,
	setStatusFilter,
	statusFilter,
	table,
}: MasterPromotionTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<MasterPromotionRecord>
				emptyDescription="Try a different code, promotion type, cycle coverage, target, value, starting date, expiration, or status."
				emptyIcon={<Tags className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No promotions found"
				minWidthClassName="min-w-[112rem]"
				paginationStorageKey={MasterPromotionPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,3fr)_minmax(11rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search promotions"
							value={query}
							onChange={setQuery}
							placeholder="Search codes, types, cycles, targets, dates, values, or status"
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={MasterPromotionStatusFilterOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setStatusFilter(
									value as MasterPromotionStatusFilter,
								)
							}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<MasterPromotionTableRow
						key={row.id}
						record={row.original}
						onDeleteRecord={setPendingDeleteRecord}
					/>
				)}
			/>
		</div>
	);
}
