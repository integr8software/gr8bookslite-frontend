"use client";

import { Search } from "lucide-react";
import { BankMasterfileTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/bank-masterfile/BankMasterfileConstants";
import { getBankMasterfileTableMinWidthClassName } from "@/app/src/data/modules/maintenance/bank-masterfile/BankMasterfileData";
import { useBankMasterfileTable } from "@/app/src/hooks/modules/maintenance/bank-masterfile/useBankMasterfileTable";
import type { BankMasterfileTableProps } from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { BankMasterfileTableFilters } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileTableFilters";
import { BankMasterfileTableRow } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileTableRow";

export function BankMasterfileTable({
	banks,
	filteredBanks,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	lastSyncedAt,
	permissions,
	query,
	statusFilter,
	onEditBank,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onToggleStatus,
	onViewBank,
}: BankMasterfileTableProps) {
	const table = useBankMasterfileTable(filteredBanks);
	const tableMinWidthClassName = getBankMasterfileTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add a bank account to start managing Cash in Bank chart accounts."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Bank Records Found"
				isLoading={isLoading}
				isSyncing={isRefreshing}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={BankMasterfileTablePaginationStorageKey}
				table={table}
				tableTitle="Bank Accounts"
				toolbar={
					<BankMasterfileTableFilters
						exportAllRows={banks}
						exportFilteredRows={filteredBanks}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						permissions={permissions}
						query={query}
						statusFilter={statusFilter}
						table={table}
						onQueryChange={onQueryChange}
						onRefresh={onRefresh}
						onStatusFilterChange={onStatusFilterChange}
					/>
				}
				renderRow={(row) => (
					<BankMasterfileTableRow
						key={row.id}
						row={row}
						permissions={permissions}
						onEditBank={onEditBank}
						onToggleStatus={onToggleStatus}
						onViewBank={onViewBank}
					/>
				)}
			/>
		</div>
	);
}
