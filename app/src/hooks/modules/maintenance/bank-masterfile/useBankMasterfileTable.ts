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
	BankMasterfileDefaultColumnOrder,
	BankMasterfileDefaultColumnVisibility,
	BankMasterfileDefaultSorting,
	BankMasterfileTableColumns,
	BankMasterfileTablePreferencesModuleKey,
	BankMasterfileTablePreferencesStorageKey,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	BankMasterfile,
	BankMasterfileTableColumnKey,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

export function useBankMasterfileTable(banks: BankMasterfile[]) {
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
		defaultColumnOrder: BankMasterfileDefaultColumnOrder,
		defaultColumnVisibility: BankMasterfileDefaultColumnVisibility,
		defaultSorting: BankMasterfileDefaultSorting,
		moduleKey: BankMasterfileTablePreferencesModuleKey,
		storageKey: BankMasterfileTablePreferencesStorageKey,
	});

	const columns = useMemo<ColumnDef<BankMasterfile>[]>(
		() =>
			BankMasterfileTableColumns.map((column) => {
				const meta = {
					className: column.className,
					label: column.label,
				};

				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta,
					};
				}

				return createBankMasterfileColumn(
					column.key,
					column.label,
					meta,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: banks,
		columns,
		initialState: {
			columnOrder: BankMasterfileDefaultColumnOrder,
			columnVisibility: BankMasterfileDefaultColumnVisibility,
			sorting: BankMasterfileDefaultSorting,
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

function createBankMasterfileColumn(
	key: BankMasterfileTableColumnKey,
	header: string,
	meta: {
		className: string;
		label: string;
	},
): ColumnDef<BankMasterfile> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta,
	};
}
