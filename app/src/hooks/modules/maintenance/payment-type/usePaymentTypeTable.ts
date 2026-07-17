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
	PaymentTypeDefaultColumnOrder,
	PaymentTypeDefaultColumnVisibility,
	PaymentTypeDefaultSorting,
	PaymentTypeTableColumns,
	PaymentTypeTablePreferencesModuleKey,
	PaymentTypeTablePreferencesStorageKey,
} from "@/app/src/constants/modules/maintenance/payment-type/PaymentTypeConstants";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import type {
	PaymentTypeRecord,
	PaymentTypeTableColumnKey,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export function usePaymentTypeTable(paymentTypes: PaymentTypeRecord[]) {
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
		defaultColumnOrder: PaymentTypeDefaultColumnOrder,
		defaultColumnVisibility: PaymentTypeDefaultColumnVisibility,
		defaultSorting: PaymentTypeDefaultSorting,
		moduleKey: PaymentTypeTablePreferencesModuleKey,
		storageKey: PaymentTypeTablePreferencesStorageKey,
	});

	const columns = useMemo<ColumnDef<PaymentTypeRecord>[]>(
		() =>
			PaymentTypeTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return createPaymentTypeColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	return useReactTable({
		data: paymentTypes,
		columns,
		initialState: {
			columnOrder: PaymentTypeDefaultColumnOrder,
			columnVisibility: PaymentTypeDefaultColumnVisibility,
			sorting: PaymentTypeDefaultSorting,
		},
		state: { columnOrder, columnVisibility, pagination, sorting },
		onColumnOrderChange: setColumnOrder,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
}

function createPaymentTypeColumn(
	key: PaymentTypeTableColumnKey,
	header: string,
	className: string,
): ColumnDef<PaymentTypeRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className, label: header },
	};
}

