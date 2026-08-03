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
	DefaultAccountDefaultColumnOrder,
	DefaultAccountDefaultColumnVisibility,
	DefaultAccountDefaultSorting,
	DefaultAccountTableColumns,
	DefaultAccountTablePreferencesModuleKey,
	DefaultAccountTablePreferencesStorageKey,
	getDefaultAccountTypeLabel,
} from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	DefaultAccount,
	DefaultAccountColumnMeta,
	DefaultAccountTableColumnKey,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";

export function useDefaultAccountTable(defaultAccounts: DefaultAccount[]) {
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
		defaultColumnOrder: DefaultAccountDefaultColumnOrder,
		defaultColumnVisibility: DefaultAccountDefaultColumnVisibility,
		defaultSorting: DefaultAccountDefaultSorting,
		moduleKey: DefaultAccountTablePreferencesModuleKey,
		storageKey: DefaultAccountTablePreferencesStorageKey,
	});

	const columns = useMemo<ColumnDef<DefaultAccount>[]>(
		() =>
			DefaultAccountTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createDefaultAccountColumn(column.key, column.label, {
					className: column.className,
				});
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: defaultAccounts,
		columns,
		initialState: {
			columnOrder: DefaultAccountDefaultColumnOrder,
			columnVisibility: DefaultAccountDefaultColumnVisibility,
			sorting: DefaultAccountDefaultSorting,
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

function createDefaultAccountColumn(
	key: DefaultAccountTableColumnKey,
	header: string,
	meta: DefaultAccountColumnMeta,
): ColumnDef<DefaultAccount> {
	const columnMeta = { ...meta, label: header };

	if (key === "accountCode") {
		return {
			id: key,
			accessorFn: (row) =>
				row.generatedAccounts.map((account) => account.accountCode).join(" "),
			header,
			sortingFn: "alphanumeric",
			meta: columnMeta,
		};
	}

	if (key === "accountName") {
		return {
			id: key,
			accessorFn: (row) =>
				row.generatedAccounts.map((account) => account.accountTitle).join(" "),
			header,
			sortingFn: "alphanumeric",
			meta: columnMeta,
		};
	}

	if (key === "type") {
		return {
			id: key,
			accessorFn: (row) => getDefaultAccountTypeLabel(row.type),
			header,
			sortingFn: "alphanumeric",
			meta: columnMeta,
		};
	}

	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: columnMeta,
	};
}

