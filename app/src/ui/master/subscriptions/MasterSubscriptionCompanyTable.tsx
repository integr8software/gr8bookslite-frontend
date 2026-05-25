"use client";

import { Search, X } from "lucide-react";
import { MasterSubscriptionPaginationStorageKey } from "@/app/src/constants/master/subscriptions/MasterSubscriptionConstants";
import type { useMasterSubscriptionsPage } from "@/app/src/hooks/master/subscriptions/useMasterSubscriptionsPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { MasterSubscriptionTableRow } from "@/app/src/ui/master/subscriptions/MasterSubscriptionTableRow";

type MasterSubscriptionCompanyTableProps = Pick<
	ReturnType<typeof useMasterSubscriptionsPage>,
	| "plansById"
	| "query"
	| "resetSubscriptionFilters"
	| "setQuery"
	| "subscriptionQuotes"
	| "table"
>;

export function MasterSubscriptionCompanyTable({
	plansById,
	query,
	resetSubscriptionFilters,
	setQuery,
	subscriptionQuotes,
	table,
}: MasterSubscriptionCompanyTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="grid gap-3 border-b border-darknavy/10 p-4 lg:grid-cols-[1fr_auto]">
				<label className="relative block">
					<span className="sr-only">Search subscriptions</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40"
						aria-hidden="true"
					/>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search companies, owners, plans, or status"
						className="h-11 w-full rounded-lg border border-darknavy/10 bg-white pl-11 pr-4 text-sm text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
					/>
				</label>
				<button
					type="button"
					onClick={resetSubscriptionFilters}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/65 shadow-sm transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Reset
				</button>
			</div>
			<ModuleTable
				emptyDescription="Try a different company, owner, plan, or subscription status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No subscriptions found"
				minWidthClassName="min-w-[99rem]"
				paginationStorageKey={MasterSubscriptionPaginationStorageKey}
				table={table}
				renderRow={(row) => (
					<MasterSubscriptionTableRow
						key={row.id}
						plan={plansById.get(row.original.planId)}
						quote={subscriptionQuotes[row.original.id]}
						subscription={row.original}
					/>
				)}
			/>
		</div>
	);
}
