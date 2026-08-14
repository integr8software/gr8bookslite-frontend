"use client";

import { Search } from "lucide-react";
import {
	WorkspaceBillingTransactionStatusOptions,
	WorkspaceBillingTransactionsPaginationStorageKey,
} from "@/app/src/constants/workspace/billing-and-transactions/WorkspaceBillingTransactionsConstants";
import type { useWorkspaceBillingTransactionsPage } from "@/app/src/hooks/workspace/billing-and-transactions/useWorkspaceBillingTransactionsPage";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";
import type {
	WorkspaceBillingTransactionRecord,
	WorkspaceBillingTransactionStatus,
} from "@/app/src/types/workspace/billing-and-transactions/WorkspaceBillingTransactionsTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { WorkspaceBillingTransactionsTableRow } from "@/app/src/ui/workspace/billing-and-transactions/WorkspaceBillingTransactionsTableRow";

type WorkspaceBillingTransactionsTableProps = {
	page: ReturnType<typeof useWorkspaceBillingTransactionsPage>;
};

export function WorkspaceBillingTransactionsTable({
	page,
}: WorkspaceBillingTransactionsTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable<WorkspaceBillingTransactionRecord>
				variant="embedded"
				emptyDescription="Adjust section, status, billing mode, or search filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No billing transactions found"
				isLoading={page.isLoading}
				isSyncing={page.isSyncing}
				lastSyncedAt={page.lastSyncedAt}
				minWidthClassName="min-w-[98rem]"
				paginationLabel="transactions"
				paginationStorageKey={WorkspaceBillingTransactionsPaginationStorageKey}
				table={page.table}
				tableTitle="Billing and transaction history"
				toolbar={
					<ModuleTableToolbar className="xl:grid-cols-[minmax(24rem,2.2fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(9rem,0.65fr)]">
						<ModuleTableSearch
							label="Search billing transactions"
							value={page.query}
							onChange={page.setQuery}
							placeholder="Search invoice, company, description, or reference"
						/>
						<ModuleTableFilterSelect
							label="Status"
							value={page.statusFilter}
							options={[
								{ label: "All statuses", value: "all" },
								...WorkspaceBillingTransactionStatusOptions.map((status) => ({
									label: status,
									value: status,
								})),
							]}
							onChange={(value) =>
								page.setStatusFilter(
									value as WorkspaceBillingTransactionStatus | "all",
								)
							}
						/>
						<ModuleTableFilterSelect
							label="Mode"
							value={page.billingModeFilter}
							options={[
								{ label: "All modes", value: "all" },
								{ label: "AUTO", value: "AUTO" },
								{ label: "MANUAL", value: "MANUAL" },
							]}
							onChange={(value) =>
								page.setBillingModeFilter(value as BillingMode | "all")
							}
						/>
						<ModuleTableResetButton onClick={page.resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<WorkspaceBillingTransactionsTableRow
						key={row.id}
						record={row.original}
						onSelect={() => page.setSelectedRecordId(row.original.id)}
					/>
				)}
			/>
		</div>
	);
}
