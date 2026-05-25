"use client";

import { Tags } from "lucide-react";
import { MasterPromotionPaginationStorageKey } from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import type { useMasterPromotionListPage } from "@/app/src/hooks/master/promotions/useMasterPromotionListPage";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
import { MasterPromotionTableRow } from "@/app/src/ui/master/promotions/MasterPromotionTableRow";

type MasterPromotionTableProps = Pick<
	ReturnType<typeof useMasterPromotionListPage>,
	"query" | "resetFilters" | "setQuery" | "table" | "toggleRecordStatus"
>;

export function MasterPromotionTable({
	query,
	resetFilters,
	setQuery,
	table,
	toggleRecordStatus,
}: MasterPromotionTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<MasterPromotionRecord>
				emptyDescription="Try a different code, promotion type, target, value, or status."
				emptyIcon={<Tags className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No promotions found"
				minWidthClassName="min-w-[84rem]"
				paginationStorageKey={MasterPromotionPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,3fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search promotions"
							value={query}
							onChange={setQuery}
							placeholder="Search promo codes, coupons, vouchers, events, or targets"
						/>
						<ModuleTableFilterButton onClick={resetFilters}>
							Reset
						</ModuleTableFilterButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<MasterPromotionTableRow
						key={row.id}
						record={row.original}
						onToggleStatus={toggleRecordStatus}
					/>
				)}
			/>
		</div>
	);
}
