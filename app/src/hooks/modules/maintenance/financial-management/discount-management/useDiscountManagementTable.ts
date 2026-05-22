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
import { DiscountManagementTableColumns } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import type {
	Discount,
	DiscountManagementTableColumnKey,
	DiscountManagementTableRecord,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

export function useDiscountManagementTable(discounts: Discount[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "description", desc: false },
	]);
	const tableData = useMemo<DiscountManagementTableRecord[]>(
		() =>
			discounts.map((discount) => ({
				...discount,
				accountLabel:
					discount.accountCode && discount.accountTitle
						? `${discount.accountCode} - ${discount.accountTitle}`
						: "No account selected",
			})),
		[discounts],
	);
	const columns = useMemo<ColumnDef<DiscountManagementTableRecord>[]>(
		() =>
			DiscountManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createDiscountManagementColumn(
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

function createDiscountManagementColumn(
	key: DiscountManagementTableColumnKey,
	header: string,
	className: string,
): ColumnDef<DiscountManagementTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
