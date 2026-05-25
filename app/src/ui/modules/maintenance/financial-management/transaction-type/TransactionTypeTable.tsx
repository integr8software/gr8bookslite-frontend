"use client";

import { Search } from "lucide-react";
import { TransactionTypePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import { useTransactionTypeTable } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionTypeTable";
import type { TransactionType } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TransactionTypeTableRow } from "@/app/src/ui/modules/maintenance/financial-management/transaction-type/TransactionTypeTableRow";

type TransactionTypeTableProps = {
	isLoading: boolean;
	transactionTypes: TransactionType[];
	onDelete: (transactionType: TransactionType) => void;
};

export function TransactionTypeTable({
	isLoading,
	transactionTypes,
	onDelete,
}: TransactionTypeTableProps) {
	const table = useTransactionTypeTable(transactionTypes);

	return (
		<ModuleTable
			emptyDescription="Add a transaction type to start mapping posting behaviors."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No transaction types found"
			isLoading={isLoading}
			minWidthClassName="min-w-[64rem]"
			paginationStorageKey={TransactionTypePaginationStorageKey}
			table={table}
			renderRow={({ id, original }) => (
				<TransactionTypeTableRow
					key={id}
					transactionType={original}
					onDelete={onDelete}
				/>
			)}
		/>
	);
}
