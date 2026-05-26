"use client";

import { Tags } from "lucide-react";
import {
	MasterSubscriberPromotionAssignmentModeFilterOptions,
	MasterSubscriberPromotionPaginationStorageKey,
	MasterSubscriberPromotionStatusOptions,
} from "@/app/src/constants/master/subscriber-promotions/MasterSubscriberPromotionConstants";
import type {
	MasterSubscriberPromotionModeFilter,
	MasterSubscriberPromotionStatusFilter,
	useMasterSubscriberPromotionListPage,
} from "@/app/src/hooks/master/subscriber-promotions/useMasterSubscriberPromotionListPage";
import type { MasterSubscriberPromotionRecord } from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
import { MasterSubscriberPromotionTableRow } from "@/app/src/ui/master/subscriber-promotions/MasterSubscriberPromotionTableRow";

type MasterSubscriberPromotionTableProps = Pick<
	ReturnType<typeof useMasterSubscriberPromotionListPage>,
	| "modeFilter"
	| "query"
	| "resetFilters"
	| "setModeFilter"
	| "setQuery"
	| "setStatusFilter"
	| "statusFilter"
	| "table"
>;

export function MasterSubscriberPromotionTable({
	modeFilter,
	query,
	resetFilters,
	setModeFilter,
	setQuery,
	setStatusFilter,
	statusFilter,
	table,
}: MasterSubscriberPromotionTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<MasterSubscriberPromotionRecord>
				variant="embedded"
				emptyDescription="Try a different subscriber, promotion code, status, assignment mode, or invoice."
				emptyIcon={<Tags className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No subscriber promotions found"
				minWidthClassName="min-w-[96rem]"
				paginationStorageKey={MasterSubscriberPromotionPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search subscriber promotions"
							value={query}
							onChange={setQuery}
							placeholder="Search subscribers, promo codes, invoices, or notes"
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={statusFilter}
							options={MasterSubscriberPromotionStatusOptions.map((option) => ({
								label: option,
								value: option,
							}))}
							onChange={(value) =>
								setStatusFilter(
									value as MasterSubscriberPromotionStatusFilter,
								)
							}
						/>
						<ModuleTableFilterSelect
							label="Mode"
							value={modeFilter}
							options={MasterSubscriberPromotionAssignmentModeFilterOptions.map(
								(option) => ({
									label: option,
									value: option,
								}),
							)}
							onChange={(value) =>
								setModeFilter(value as MasterSubscriberPromotionModeFilter)
							}
						/>
						<ModuleTableFilterButton onClick={resetFilters}>
							Reset
						</ModuleTableFilterButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<MasterSubscriberPromotionTableRow
						key={row.id}
						record={row.original}
					/>
				)}
			/>
		</div>
	);
}
