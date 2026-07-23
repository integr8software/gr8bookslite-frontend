"use client";

import { Search } from "lucide-react";
import { DefaultAccountTablePaginationStorageKey } from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import { getDefaultAccountTableMinWidthClassName } from "@/app/src/data/modules/financial-maintenance/default-account/DefaultAccountData";
import { useDefaultAccountTable } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccountTable";
import type { DefaultAccountTableProps } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { DefaultAccountTableFilters } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountTableFilters";
import { DefaultAccountTableRow } from "@/app/src/ui/modules/financial-maintenance/default-account/DefaultAccountTableRow";

export function DefaultAccountTable({
	defaultAccounts,
	filteredDefaultAccounts,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	permissions,
	query,
	statusFilter,
	typeFilter,
	onEditDefaultAccount,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onToggleStatus,
	onTypeFilterChange,
	onViewDefaultAccount,
}: DefaultAccountTableProps) {
	const table = useDefaultAccountTable(filteredDefaultAccounts);
	const tableMinWidthClassName = getDefaultAccountTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a default account to generate linked Chart of Accounts records."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Default Account Records Found"
				isLoading={isLoading}
				isSyncing={isRefreshing}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={DefaultAccountTablePaginationStorageKey}
				table={table}
				tableTitle="Default Account Templates"
				toolbar={
					<DefaultAccountTableFilters
						exportAllRows={defaultAccounts}
						exportFilteredRows={filteredDefaultAccounts}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						query={query}
						statusFilter={statusFilter}
						table={table}
						typeFilter={typeFilter}
						onQueryChange={onQueryChange}
						onRefresh={onRefresh}
						onStatusFilterChange={onStatusFilterChange}
						onTypeFilterChange={onTypeFilterChange}
					/>
				}
				renderRow={(row) => (
					<DefaultAccountTableRow
						key={row.id}
						row={row}
						permissions={permissions}
						onEditDefaultAccount={onEditDefaultAccount}
						onToggleStatus={onToggleStatus}
						onViewDefaultAccount={onViewDefaultAccount}
					/>
				)}
			/>
		</div>
	);
}


