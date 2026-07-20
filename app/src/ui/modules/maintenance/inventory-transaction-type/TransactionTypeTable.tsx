"use client";

import { Search } from "lucide-react";
import { TransactionTypePaginationStorageKey } from "@/app/src/constants/modules/maintenance/inventory-transaction-type/TransactionTypeConstants";
import { getTransactionTypeTableMinWidthClassName } from "@/app/src/data/modules/maintenance/inventory-transaction-type/TransactionTypeData";
import { useTransactionTypeTable } from "@/app/src/hooks/modules/maintenance/inventory-transaction-type/useTransactionTypeTable";
import type { TransactionTypeTableProps } from "@/app/src/types/modules/maintenance/inventory-transaction-type/TransactionTypeTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TransactionTypeTableRow } from "@/app/src/ui/modules/maintenance/inventory-transaction-type/TransactionTypeTableRow";

export function TransactionTypeTable({
	isLoading,
	lastSyncedAt,
	transactionTypes,
	toolbar,
	onEdit,
	onToggleStatus,
	onView,
}: TransactionTypeTableProps) {
	const table = useTransactionTypeTable(transactionTypes);
	const tableMinWidthClassName = getTransactionTypeTableMinWidthClassName(
		table.getVisibleLeafColumns().length,
	);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add an inventory transaction type to start classifying goods receipt and goods issue movements."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No Inventory Transaction Types Found"
				isLoading={isLoading}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={TransactionTypePaginationStorageKey}
				table={table}
				tableTitle="Inventory transaction types"
				toolbar={toolbar}
				renderRow={({ id, original }) => (
					<TransactionTypeTableRow
						key={id}
						transactionType={original}
						onEdit={onEdit}
						onToggleStatus={onToggleStatus}
						onView={onView}
					/>
				)}
			/>
		</div>
	);
}
