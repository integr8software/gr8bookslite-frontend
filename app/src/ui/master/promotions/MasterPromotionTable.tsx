"use client";

import { Search, Tags, X } from "lucide-react";
import { MasterPromotionPaginationStorageKey } from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import type { useMasterPromotionListPage } from "@/app/src/hooks/master/promotions/useMasterPromotionListPage";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
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
			<div className="grid gap-3 border-b border-darknavy/10 p-4 lg:grid-cols-[1fr_auto]">
				<label className="relative block">
					<span className="sr-only">Search promotions</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40"
						aria-hidden="true"
					/>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search promo codes, coupons, vouchers, events, or targets"
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
			<ModuleTable<MasterPromotionRecord>
				emptyDescription="Try a different code, promotion type, target, value, or status."
				emptyIcon={<Tags className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No promotions found"
				minWidthClassName="min-w-[84rem]"
				paginationStorageKey={MasterPromotionPaginationStorageKey}
				table={table}
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
