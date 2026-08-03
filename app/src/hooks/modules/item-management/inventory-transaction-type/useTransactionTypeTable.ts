"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	TransactionTypeDefaultColumnOrder,
	TransactionTypeDefaultColumnVisibility,
	TransactionTypeDefaultSorting,
	TransactionTypeTableColumns,
	TransactionTypeTablePreferencesModuleKey,
	TransactionTypeTablePreferencesStorageKey,
} from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	TransactionType,
	TransactionTypeTableColumnKey,
	TransactionTypeTableRecord,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";

export function useTransactionTypeTable(transactionTypes: TransactionType[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const {
		columnOrder,
		columnVisibility,
		sorting,
		setColumnOrder,
		setColumnVisibility,
		setSorting,
	} = useTablePreferences({
		defaultColumnOrder: TransactionTypeDefaultColumnOrder,
		defaultColumnVisibility: TransactionTypeDefaultColumnVisibility,
		defaultSorting: TransactionTypeDefaultSorting,
		moduleKey: TransactionTypeTablePreferencesModuleKey,
		storageKey: TransactionTypeTablePreferencesStorageKey,
	});
	const tableData = useMemo<TransactionTypeTableRecord[]>(
		() => transactionTypes.map(createTransactionTypeTableRecord),
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
					meta: { className: column.className, label: column.label },
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
		initialState: {
			columnOrder: TransactionTypeDefaultColumnOrder,
			columnVisibility: TransactionTypeDefaultColumnVisibility,
			sorting: TransactionTypeDefaultSorting,
		},
		state: {
			columnOrder,
			columnVisibility,
			pagination,
			sorting,
		},
		onColumnOrderChange: setColumnOrder,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
}

export function createTransactionTypeTableRecord(
	transactionType: TransactionType,
): TransactionTypeTableRecord {
	const legacyTransactionType = transactionType as TransactionType & {
		type?: string;
	};

	return {
		...transactionType,
		name:
			transactionType.name ??
			legacyTransactionType.type ??
			transactionType.description,
		accountLabel: transactionType.accountTitle || "No account selected",
		moduleLabel: getTransactionTypeModuleLabel(transactionType),
	};
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
		meta: { className, label: header },
	};
}

function getTransactionTypeModuleLabel(transactionType: TransactionType) {
	if (transactionType.moduleNames?.length) {
		return transactionType.moduleNames.join(", ");
	}

	return transactionType.moduleName || "No module selected";
}
