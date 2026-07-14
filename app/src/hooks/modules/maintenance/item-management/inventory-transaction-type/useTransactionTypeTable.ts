"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TransactionTypeTableColumns } from "@/app/src/constants/modules/maintenance/item-management/inventory-transaction-type/TransactionTypeConstants";
import type {
	TransactionType,
	TransactionTypeTableColumnKey,
	TransactionTypeTableRecord,
} from "@/app/src/types/modules/maintenance/item-management/inventory-transaction-type/TransactionTypeTypes";

export function useTransactionTypeTable(transactionTypes: TransactionType[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableData = useMemo<TransactionTypeTableRecord[]>(
		() =>
			transactionTypes.map((transactionType) => {
				const legacyTransactionType = transactionType as TransactionType & {
					type?: string;
				};

				return {
					...transactionType,
					name:
						transactionType.name ??
						legacyTransactionType.type ??
						transactionType.description,
					accountLabel:
						transactionType.accountTitle || "No account selected",
					moduleLabel: getTransactionTypeModuleLabel(transactionType),
				};
			}),
		[transactionTypes],
	);
	const columns = useMemo<ColumnDef<TransactionTypeTableRecord>[]>(
		() =>
			TransactionTypeTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createTransactionTypeColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: tableData,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
}

function createTransactionTypeColumn(
	key: TransactionTypeTableColumnKey,
	header: string,
	className: string,
): ColumnDef<TransactionTypeTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}

function getTransactionTypeModuleLabel(transactionType: TransactionType) {
	if (transactionType.moduleNames?.length) {
		return transactionType.moduleNames.join(", ");
	}

	return transactionType.moduleName || "No module selected";
}
