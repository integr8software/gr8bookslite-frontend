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
import { ItemSetupTableColumns } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import type {
	ItemSetupKind,
	ItemSetupRecord,
	ItemSetupTableColumnKey,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { useItemManagementStore } from "./useItemManagement";

export function useItemSetupListPage(kind: ItemSetupKind) {
	const store = useItemManagementStore();
	const records = store.getSetupRecords(kind);
	const [pendingDeleteRecord, setPendingDeleteRecord] =
		useState<ItemSetupRecord | null>(null);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const columns = useMemo<ColumnDef<ItemSetupRecord>[]>(
		() =>
			ItemSetupTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createItemSetupColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
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
		getSortedRowModel: getSortedRowModel(),
	});

	function handleConfirmDelete() {
		if (!pendingDeleteRecord) {
			return;
		}

		store.deleteSetupRecord(kind, pendingDeleteRecord.id);
		setPendingDeleteRecord(null);
	}

	return {
		handleConfirmDelete,
		isLoading: store.isLoading,
		isMutating: store.isMutating,
		pendingDeleteRecord,
		setPendingDeleteRecord,
		table,
	};
}

function createItemSetupColumn(
	key: ItemSetupTableColumnKey,
	header: string,
	className: string,
): ColumnDef<ItemSetupRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}

