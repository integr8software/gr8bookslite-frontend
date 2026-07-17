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
import { SalesJournalStatusFilters } from "@/app/src/constants/modules/sales/sales-journal/SalesJournalConstants";
import { getSalesJournalTotals } from "@/app/src/data/modules/sales/sales-journal/SalesJournalData";
import { useSalesJournalStore } from "@/app/src/hooks/modules/sales/sales-journal/useSalesJournal";
import type { SalesJournalRecord } from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useSalesJournalListPage() {
	const {
		deleteRecord,
		isLoading,
		isMutating,
		lastSyncedAt,
		records,
		updateRecordStatus,
	} =
		useSalesJournalStore();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQuery] = useState("");
	const [dateRange, setDateRangeState] = useState<DateRangeValue>({
		from: "",
		to: "",
	});
	const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({
		from: "",
		to: "",
	});
	const [statusFilter, setStatusFilterState] = useState<
		(typeof SalesJournalStatusFilters)[number]
	>("all");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "documentDate", desc: true },
	]);
	const [pendingDeleteRecord, setPendingDeleteRecord] =
		useState<SalesJournalRecord | null>(null);

	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return records.filter((record) => {
			const searchable = [
				record.documentNo,
				record.partyCode,
				record.partyName,
				record.remarks,
				record.status,
			]
				.join(" ")
				.toLowerCase();
			const totals = getSalesJournalTotals(record.lines);

			return (
				searchable.includes(normalizedQuery) &&
				(statusFilter === "all" || record.status === statusFilter) &&
				isDateInRange(record.documentDate, dateRange) &&
				isAmountInRange(totals.totalDebit, amountRange)
			);
		});
	}, [amountRange, dateRange, query, records, statusFilter]);

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

	function setDateRange(value: DateRangeValue) {
		setDateRangeState(value);
		table.setPageIndex(0);
	}

	function setAmountRange(value: AmountRangeValue) {
		setAmountRangeState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: (typeof SalesJournalStatusFilters)[number]) {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	function resetFilters() {
		setQuery("");
		setDateRangeState({ from: "", to: "" });
		setAmountRangeState({ from: "", to: "" });
		setStatusFilterState("all");
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
		amountRange,
		dateRange,
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		lastSyncedAt,
		pendingDeleteRecord,
		query,
		records,
		resetFilters,
		setAmountRange,
		setDateRange,
		setPendingDeleteRecord,
		setStatusFilter,
		statusFilter,
		table,
		updateRecordStatus,
	};
}

function isAmountInRange(value: number, range: AmountRangeValue) {
	const fromAmount = range.from.trim()
		? Number(range.from.replaceAll(",", ""))
		: 0;
	const toAmount = range.to.trim()
		? Number(range.to.replaceAll(",", ""))
		: Number.MAX_SAFE_INTEGER;

	return value >= fromAmount && value <= toAmount;
}

function isDateInRange(value: string, range: DateRangeValue) {
	if (!range.from && !range.to) {
		return true;
	}

	const dateTime = new Date(value).setHours(0, 0, 0, 0);
	const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
	const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

	return !(
		(fromTime !== null && dateTime < fromTime) ||
		(toTime !== null && dateTime > toTime)
	);
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
