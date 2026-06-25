"use client";

import { Search } from "lucide-react";
import { TransactionNumberSetupPaginationStorageKey } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import type { useTransactionNumberSetupListPage } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetupListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TransactionNumberSetupTableFilters } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupTableFilters";
import { TransactionNumberSetupTableRow } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupTableRow";

type TransactionNumberSetupTableProps = Pick<
	ReturnType<typeof useTransactionNumberSetupListPage>,
	| "branchNameById"
	| "handleQueryChange"
	| "handleScopeFilterChange"
	| "isLoading"
	| "lastSyncedAt"
	| "query"
	| "scopeFilter"
	| "table"
>;

export function TransactionNumberSetupTable({
	branchNameById,
	handleQueryChange,
	handleScopeFilterChange,
	isLoading,
	lastSyncedAt,
	query,
	scopeFilter,
	table,
}: TransactionNumberSetupTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="No numbering setup matches the current filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No numbering setups found"
				isLoading={isLoading}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName="min-w-[96rem]"
				paginationStorageKey={TransactionNumberSetupPaginationStorageKey}
				table={table}
				tableTitle="Numbering setups"
				toolbar={
					<TransactionNumberSetupTableFilters
						query={query}
						scopeFilter={scopeFilter}
						onQueryChange={handleQueryChange}
						onScopeFilterChange={handleScopeFilterChange}
					/>
				}
				renderRow={({ id, original }) => (
					<TransactionNumberSetupTableRow
						key={id}
						branchNameById={branchNameById}
						setup={original}
					/>
				)}
			/>
		</div>
	);
}
