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
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";

export function useDiscountManagementTable(discounts: Discount[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableData = useMemo<DiscountManagementTableRecord[]>(
		() =>
			discounts.map((discount) => {
				const amount = getDiscountAmount(discount);
				const discountType = discount.discountType ?? "Percentage";
				const moduleNames = discount.moduleNames ?? [];
				const name = getDiscountName(discount);

				return {
					...discount,
					amount,
					discountType,
					moduleNames,
					name,
					status: discount.status ?? "Active",
					amountLabel:
						discountType === "Percentage"
							? `${amount}%`
							: formatFixedDiscount(amount),
					accountLabel:
						discount.accountTitle
							? discount.accountTitle
							: "No account selected",
					moduleLabel:
						moduleNames.length > 0
							? moduleNames.join(", ")
							: "No module selected",
					valueLabel: discountType,
				};
			}),
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

function getDiscountAmount(discount: Discount) {
	const legacyDiscount = discount as Discount & { percentage?: number };

	return discount.amount ?? legacyDiscount.percentage ?? 0;
}

function getDiscountName(discount: Discount) {
	const legacyDiscount = discount as Discount & { name?: string };

	return legacyDiscount.name ?? discount.description;
}

function formatFixedDiscount(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}
