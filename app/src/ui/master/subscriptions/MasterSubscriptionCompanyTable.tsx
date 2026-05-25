"use client";

import { Search } from "lucide-react";
import { MasterSubscriptionPaginationStorageKey } from "@/app/src/constants/master/subscriptions/MasterSubscriptionConstants";
import type { useMasterSubscriptionsPage } from "@/app/src/hooks/master/subscriptions/useMasterSubscriptionsPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
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
			<ModuleTable
				emptyDescription="Try a different company, owner, plan, or subscription status."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No subscriptions found"
				minWidthClassName="min-w-[99rem]"
				paginationStorageKey={MasterSubscriptionPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,3fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search subscriptions"
							value={query}
							onChange={setQuery}
							placeholder="Search companies, owners, plans, or status"
						/>
						<ModuleTableFilterButton onClick={resetSubscriptionFilters}>
							Reset
						</ModuleTableFilterButton>
					</ModuleTableToolbar>
				}
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
