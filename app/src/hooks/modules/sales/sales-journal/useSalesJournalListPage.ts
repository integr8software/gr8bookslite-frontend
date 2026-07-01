"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import { getSalesJournalTotals } from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import { useSalesJournalStore } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournal";
import type { SalesJournalRecord } from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";

export function useSalesJournalListPage() {
	const { deleteRecord, isLoading, isMutating, lastSyncedAt, records } =
		useSalesJournalStore();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQuery] = useState("");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "documentDate", desc: true },
	]);
	const [pendingDeleteRecord, setPendingDeleteRecord] =
		useState<SalesJournalRecord | null>(null);

	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return records;
		}

		return records.filter((record) =>
			[
				record.documentNo,
				record.partyCode,
				record.partyName,
				record.remarks,
				record.status,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query, records]);

	const columns = useMemo<ColumnDef<SalesJournalRecord>[]>(
		() => [
			createColumn("documentNo", "Document No", "w-[11rem]"),
			createColumn("documentDate", "Document Date", "w-[11rem]"),
			createColumn("partyName", "Party", "w-[18rem]"),
			createColumn("currency", "Currency", "w-[8rem]"),
			{
				id: "totalDebit",
				header: "Debit",
				accessorFn: (record) => getSalesJournalTotals(record.lines).totalDebit,
				sortingFn: "basic",
				meta: { className: "w-[11rem] text-right" },
			},
			{
				id: "totalCredit",
				header: "Credit",
				accessorFn: (record) => getSalesJournalTotals(record.lines).totalCredit,
				sortingFn: "basic",
				meta: { className: "w-[11rem] text-right" },
			},
			createColumn("status", "Status", "w-[9rem]"),
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[9rem]" },
			},
		],
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRecords,
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

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleConfirmDelete() {
		if (!pendingDeleteRecord) {
			return;
		}

		deleteRecord(pendingDeleteRecord.id);
		setPendingDeleteRecord(null);
	}

	return {
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		lastSyncedAt,
		pendingDeleteRecord,
		query,
		setPendingDeleteRecord,
		table,
	};
}

function createColumn(
	key: keyof SalesJournalRecord,
	header: string,
	className: string,
): ColumnDef<SalesJournalRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: key === "documentDate" ? "datetime" : "alphanumeric",
		meta: { className },
	};
}
