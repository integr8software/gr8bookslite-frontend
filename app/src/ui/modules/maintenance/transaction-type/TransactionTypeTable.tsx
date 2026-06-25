"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { TransactionTypePaginationStorageKey } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import { useTransactionTypeTable } from "@/app/src/hooks/modules/maintenance/transaction-type/useTransactionTypeTable";
import type { TransactionType } from "@/app/src/types/modules/maintenance/transaction-type/TransactionTypeTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { TransactionTypeTableRow } from "@/app/src/ui/modules/maintenance/transaction-type/TransactionTypeTableRow";

type TransactionTypeTableProps = {
	isLoading: boolean;
	lastSyncedAt?: number | string | Date | null;
	transactionTypes: TransactionType[];
	toolbar?: ReactNode;
	onEdit: (transactionType: TransactionType) => void;
	onToggleStatus: (transactionType: TransactionType) => void;
	onView: (transactionType: TransactionType) => void;
};

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

	return (
		<ModuleTable
			emptyDescription="Add a transaction type to start mapping posting behaviors."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No transaction types found"
			isLoading={isLoading}
			lastSyncedAt={lastSyncedAt}
			minWidthClassName="min-w-[64rem]"
			paginationStorageKey={TransactionTypePaginationStorageKey}
			table={table}
			tableTitle="Transaction types"
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
	);
}
