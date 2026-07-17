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
	ItemAttributesDefaultSorting,
	ItemAttributesTableColumns,
} from "@/app/src/constants/modules/maintenance/item-attributes/ItemAttributesConstants";
import {
	MockItemAttributes,
	createItemAttributeRecord,
} from "@/app/src/data/modules/maintenance/item-attributes/ItemAttributesData";
import type {
	ItemAttributeFormValues,
	ItemAttributeRecord,
	ItemAttributesListPageState,
} from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";

export function useItemAttributesListPage(): ItemAttributesListPageState {
	const [records, setRecords] = useState(MockItemAttributes);
	const [drawer, setDrawer] =
		useState<ItemAttributesListPageState["drawer"]>(null);
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
					[record.name, record.values.join(" "), record.status]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, records, statusFilter]);
	const tableColumns = useMemo<ColumnDef<ItemAttributeRecord>[]>(
		() =>
			ItemAttributesTableColumns.map((column) => {
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
		columns: tableColumns,
		state: { pagination },
		initialState: { sorting: ItemAttributesDefaultSorting },
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function saveRecord(values: ItemAttributeFormValues) {
		setRecords((currentRecords) => {
			if (drawer?.mode === "edit" && drawer.record) {
				return currentRecords.map((record) =>
					record.id === drawer.record?.id
						? createItemAttributeRecord(values, record)
						: record,
				);
			}

			return [...currentRecords, createItemAttributeRecord(values)];
		});
		setDrawer(null);
	}

	return {
		activeCount: records.filter((record) => record.status === "Active").length,
		drawer,
		filteredRecords,
		query,
		records,
		statusFilter,
		table,
		tableColumns,
		closeDrawer: () => setDrawer(null),
		openAddDrawer: () => setDrawer({ mode: "add" }),
		openEditDrawer: (record) => setDrawer({ mode: "edit", record }),
		openViewDrawer: (record) => setDrawer({ mode: "view", record }),
		saveRecord,
		setQuery: (value) => {
			setQuery(value);
			table.setPageIndex(0);
		},
		setStatusFilter: (value) => {
			setStatusFilter(value);
			table.setPageIndex(0);
		},
		toggleStatus: (record) => {
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
