"use client";

import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { UnitOfMeasurementMockData } from "@/app/src/data/modules/maintenance/unit-of-measurement/UnitOfMeasurementData";
import type {
	UnitOfMeasurementDrawerState,
	UnitOfMeasurementFormValues,
	UnitOfMeasurementListPageState,
	UnitOfMeasurementRecord,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";

export function useUnitOfMeasurementListPage(): UnitOfMeasurementListPageState {
	const [records, setRecords] = useState<UnitOfMeasurementRecord[]>(
		UnitOfMeasurementMockData,
	);
	const [drawer, setDrawer] = useState<UnitOfMeasurementDrawerState>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("Active");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);

	const filteredRecords = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return records.filter(
			(record) =>
				(statusFilter === "All" || record.status === statusFilter) &&
				(!normalizedQuery ||
					[record.name, record.symbol, record.quantityMode, record.status]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, records, statusFilter]);

	const tableColumns = useMemo<ColumnDef<UnitOfMeasurementRecord>[]>(
		() => [
			createColumn("name", "Unit of Measurement", "w-[18rem]"),
			createColumn("symbol", "Symbol", "w-[9rem]"),
			createColumn("quantityMode", "Quantity Type", "w-[12rem]"),
			createColumn("status", "Status", "w-[9rem]"),
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[10rem] text-center" },
			},
		],
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRecords,
		columns: tableColumns,
		state: { pagination, sorting },
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function saveRecord(values: UnitOfMeasurementFormValues) {
		if (drawer?.mode === "edit" && drawer.record) {
			setRecords((currentRecords) =>
				currentRecords.map((record) =>
					record.id === drawer.record?.id ? { ...record, ...values } : record,
				),
			);
		}

		if (drawer?.mode === "add") {
			setRecords((currentRecords) => [
				...currentRecords,
				{
					id: `uom-${Date.now()}`,
					...values,
					symbol: values.symbol.toUpperCase(),
				},
			]);
		}

		setDrawer(null);
	}

	function toggleStatus(record: UnitOfMeasurementRecord) {
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
	}

	return {
		activeCount: records.filter((record) => record.status === "Active").length,
		decimalCount: records.filter((record) => record.quantityMode === "Float")
			.length,
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
		toggleStatus,
	};
}

function createColumn(
	key: keyof UnitOfMeasurementRecord,
	header: string,
	className: string,
): ColumnDef<UnitOfMeasurementRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
