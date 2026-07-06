"use client";

import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type PaginationState,
	type RowModel,
	type SortingState,
	type Table,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MultiCurrencySetupTableColumns } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import type {
	MultiCurrencySetupTableColumnKey,
	MultiCurrencySetupTableRecord,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export function useMultiCurrencySetupTable(
	records: MultiCurrencySetupTableRecord[],
) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "currencyCode", desc: false },
	]);
	const columns = useMemo<ColumnDef<MultiCurrencySetupTableRecord>[]>(
		() =>
			MultiCurrencySetupTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createMultiCurrencySetupColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: records,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getBaseFirstSortedRowModel(),
	});
}

function getBaseFirstSortedRowModel() {
	const getDefaultSortedRowModel =
		getSortedRowModel<MultiCurrencySetupTableRecord>();

	return (table: Table<MultiCurrencySetupTableRecord>) => {
		const getRowModel = getDefaultSortedRowModel(table);

		return (): RowModel<MultiCurrencySetupTableRecord> => {
			const rowModel = getRowModel();

			return {
				...rowModel,
				rows: [...rowModel.rows].sort(
					(firstRow, secondRow) =>
						Number(secondRow.original.isBaseCurrency) -
						Number(firstRow.original.isBaseCurrency),
				),
			};
		};
	};
}

function createMultiCurrencySetupColumn(
	key: MultiCurrencySetupTableColumnKey,
	header: string,
	className: string,
): ColumnDef<MultiCurrencySetupTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
