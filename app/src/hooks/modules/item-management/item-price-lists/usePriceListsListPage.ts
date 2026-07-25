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
	PriceListsDefaultSorting,
	PriceListsTableColumns,
} from "@/app/src/constants/modules/item-management/item-price-lists/PriceListsConstants";
import {
	MockPriceLists,
	createPriceListRecord,
} from "@/app/src/data/modules/item-management/item-price-lists/PriceListsData";
import type {
	PriceListDrawerState,
	PriceListFormValues,
	PriceListRecord,
} from "@/app/src/types/modules/item-management/item-price-lists/PriceListsTypes";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";

export function usePriceListsListPage() {
	const [records, setRecords] = useState(MockPriceLists);
	const [drawer, setDrawer] = useState<PriceListDrawerState>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("Active");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const filteredRecords = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return records.filter(
			(record) =>
				(statusFilter === "All" || record.status === statusFilter) &&
				(!normalizedQuery ||
					Object.values(record).join(" ").toLowerCase().includes(normalizedQuery)),
		);
	}, [query, records, statusFilter]);
	const columns = useMemo<ColumnDef<PriceListRecord>[]>(
		() =>
			PriceListsTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className, label: column.label },
					};
				}

				return {
					accessorKey: column.key,
					header: column.label,
					sortingFn: "alphanumeric",
					meta: { className: column.className, label: column.label },
				};
			}),
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRecords,
		columns,
		state: { pagination },
		initialState: { sorting: PriceListsDefaultSorting },
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function saveRecord(values: PriceListFormValues) {
		setRecords((currentRecords) =>
			drawer?.mode === "edit" && drawer.record
				? currentRecords.map((record) =>
						record.id === drawer.record?.id
							? createPriceListRecord(values, record)
							: record,
					)
				: [...currentRecords, createPriceListRecord(values)],
		);
		setDrawer(null);
	}

	return {
		activeCount: records.filter((record) => record.status === "Active").length,
		drawer,
		query,
		records,
		statusFilter,
		table,
		closeDrawer: () => setDrawer(null),
		openAddDrawer: () => setDrawer({ mode: "add" }),
		openEditDrawer: (record: PriceListRecord) =>
			setDrawer({ mode: "edit", record }),
		openViewDrawer: (record: PriceListRecord) =>
			setDrawer({ mode: "view", record }),
		saveRecord,
		setQuery: (value: string) => {
			setQuery(value);
			table.setPageIndex(0);
		},
		setStatusFilter: (value: string) => {
			setStatusFilter(value);
			table.setPageIndex(0);
		},
		toggleStatus: (record: PriceListRecord) => {
			setRecords((currentRecords) =>
				currentRecords.map((currentRecord) =>
					currentRecord.id === record.id
						? {
								...currentRecord,
								status:
									currentRecord.status === "Active" ? "Inactive" : "Active",
							}
						: currentRecord,
				),
			);
		},
	};
}
