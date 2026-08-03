"use client";

import { Search } from "lucide-react";
import { TransactionTypePaginationStorageKey } from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import { getTransactionTypeTableMinWidthClassName } from "@/app/src/data/modules/item-management/inventory-transaction-type/TransactionTypeData";
import { createTransactionTypeTableRecord } from "@/app/src/hooks/modules/item-management/inventory-transaction-type/useTransactionTypeTable";
import type { TransactionTypeTableProps } from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TransactionTypeFilters } from "@/app/src/ui/modules/item-management/inventory-transaction-type/TransactionTypeFilters";
import { TransactionTypeTableRow } from "@/app/src/ui/modules/item-management/inventory-transaction-type/TransactionTypeTableRow";

export function TransactionTypeTable({
	filteredTransactionTypes,
	hasActiveFilters,
	isLoading,
	isRefreshing,
	isSyncing,
	lastSyncedAt,
	moduleFilter,
	moduleFilterOptions,
	searchTerm,
	statusFilter,
	table,
	transactionTypes,
	onEdit,
	onModuleFilterChange,
	onRefresh,
	onSearchTermChange,
	onStatusFilterChange,
	onToggleStatus,
	onView,
}: TransactionTypeTableProps) {
	const tableMinWidthClassName = getTransactionTypeTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);
	const exportAllRows = transactionTypes.map(createTransactionTypeTableRecord);
	const exportFilteredRows = filteredTransactionTypes.map(
		createTransactionTypeTableRecord,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add an inventory transaction type to start classifying goods receipt and goods issue movements."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Inventory Transaction Types Found"
				isLoading={isLoading}
				isSyncing={isSyncing}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={TransactionTypePaginationStorageKey}
				table={table}
				tableTitle="Inventory Transaction Types"
				toolbar={
					<TransactionTypeFilters
						exportAllRows={exportAllRows}
						exportFilteredRows={exportFilteredRows}
						hasActiveFilters={hasActiveFilters}
						isRefreshing={isRefreshing}
						moduleFilter={moduleFilter}
						moduleFilterOptions={moduleFilterOptions}
						searchTerm={searchTerm}
						statusFilter={statusFilter}
						table={table}
						onModuleFilterChange={onModuleFilterChange}
						onRefresh={onRefresh}
						onSearchTermChange={onSearchTermChange}
						onStatusFilterChange={onStatusFilterChange}
					/>
				}
				renderRow={(row) => (
					<TransactionTypeTableRow
						key={row.id}
						row={row}
						onEdit={onEdit}
						onToggleStatus={onToggleStatus}
						onView={onView}
					/>
				)}
			/>
		</div>
	);
}
