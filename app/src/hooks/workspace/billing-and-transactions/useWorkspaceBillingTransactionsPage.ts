"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";
import { WorkspaceBillingTransactionTableColumns } from "@/app/src/constants/workspace/billing-and-transactions/WorkspaceBillingTransactionsConstants";
import {
	formatWorkspaceBillingTransactionAmount,
	formatWorkspaceBillingTransactionCategory,
	formatWorkspaceBillingTransactionDate,
	getRecentWorkspaceBillingTransactions,
	getWorkspaceBillingTransactionsSummary,
	queryWorkspaceBillingTransactions,
} from "@/app/src/data/workspace/billing-and-transactions/WorkspaceBillingTransactionsData";
import { GetWorkspaceBillingTransactions } from "@/app/src/services/workspace/billing-and-transactions/WorkspaceBillingTransactionsApi";
import { WorkspaceBillingTransactionsQueryKeys } from "@/app/src/services/workspace/billing-and-transactions/WorkspaceBillingTransactionsQueryKeys";
import type {
	WorkspaceBillingTransactionRecord,
	WorkspaceBillingTransactionSection,
	WorkspaceBillingTransactionStatus,
	WorkspaceBillingTransactionTableColumnKey,
	WorkspaceBillingTransactionsFilters,
} from "@/app/src/types/workspace/billing-and-transactions/WorkspaceBillingTransactionsTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

const InitialFilters: WorkspaceBillingTransactionsFilters = {
	billingMode: "all",
	query: "",
	section: "overview",
	status: "all",
};

export function useWorkspaceBillingTransactionsPage() {
	const [filters, setFilters] =
		useState<WorkspaceBillingTransactionsFilters>(InitialFilters);
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "date", desc: true },
	]);
	const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
	const recordsQuery = useQuery({
		queryKey: WorkspaceBillingTransactionsQueryKeys.records(),
		queryFn: GetWorkspaceBillingTransactions,
		staleTime: Number.POSITIVE_INFINITY,
	});
	const payload = recordsQuery.data;
	const records = useMemo(() => payload?.records ?? [], [payload?.records]);
	const filteredRecords = useMemo(
		() => queryWorkspaceBillingTransactions(filters, records),
		[filters, records],
	);
	const recentRecords = useMemo(
		() => getRecentWorkspaceBillingTransactions(records),
		[records],
	);
	const summary = useMemo(
		() =>
			payload
				? getWorkspaceBillingTransactionsSummary(payload)
				: {
						billingMode: "AUTO" as const,
						currentPlan: "-",
						nextBillingDate: "-",
						outstandingBalance: 0,
						totalBilled: 0,
						totalPaid: 0,
					},
		[payload],
	);
	const columns = useMemo<ColumnDef<WorkspaceBillingTransactionRecord>[]>(
		() =>
			WorkspaceBillingTransactionTableColumns.map((column) =>
				createWorkspaceBillingTransactionColumn(
					column.key,
					column.label,
					column.className,
				),
			),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: filteredRecords,
		state: {
			pagination,
			sorting,
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
	});
	const selectedRecord =
		records.find((record) => record.id === selectedRecordId) ?? null;

	function updateFilters(nextFilters: Partial<WorkspaceBillingTransactionsFilters>) {
		setFilters((current) => ({ ...current, ...nextFilters }));
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function resetFilters() {
		setFilters((current) => ({
			...InitialFilters,
			section: current.section,
		}));
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		activeSection: filters.section,
		billingModeFilter: filters.billingMode,
		filteredRecords,
		isError: recordsQuery.isError,
		isLoading: recordsQuery.isLoading,
		isSyncing: recordsQuery.isFetching && !recordsQuery.isLoading,
		lastSyncedAt: recordsQuery.dataUpdatedAt,
		query: filters.query,
		recentRecords,
		resetFilters,
		selectedRecord,
		setActiveSection: (section: WorkspaceBillingTransactionSection) =>
			updateFilters({ section }),
		setBillingModeFilter: (billingMode: BillingMode | "all") =>
			updateFilters({ billingMode }),
		setQuery: (query: string) => updateFilters({ query }),
		setSelectedRecordId,
		setStatusFilter: (status: WorkspaceBillingTransactionStatus | "all") =>
			updateFilters({ status }),
		statusFilter: filters.status,
		subscription: payload?.subscription ?? null,
		summary,
		table,
		totalRecordCount: records.length,
	};
}

function createWorkspaceBillingTransactionColumn(
	key: WorkspaceBillingTransactionTableColumnKey,
	label: string,
	className: string,
): ColumnDef<WorkspaceBillingTransactionRecord> {
	if (key === "date") {
		return {
			id: key,
			accessorFn: (record) =>
				formatWorkspaceBillingTransactionDate(record.date),
			header: label,
			sortingFn: (rowA, rowB) =>
				new Date(rowA.original.date).getTime() -
				new Date(rowB.original.date).getTime(),
			meta: { className },
		};
	}

	if (key === "category") {
		return {
			id: key,
			accessorFn: (record) =>
				formatWorkspaceBillingTransactionCategory(record.category),
			header: label,
			sortingFn: "alphanumeric",
			meta: { className },
		};
	}

	if (key === "amount") {
		return {
			id: key,
			accessorFn: (record) =>
				formatWorkspaceBillingTransactionAmount(
					record.amount,
					record.currencyCode,
				),
			header: label,
			sortingFn: (rowA, rowB) => rowA.original.amount - rowB.original.amount,
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header: label,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
