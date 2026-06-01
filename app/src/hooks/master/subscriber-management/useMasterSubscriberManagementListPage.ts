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
import {
	MasterSubscriberManagementDateFilterOptions,
	MasterSubscriberManagementStatusOptions,
	MasterSubscriberManagementTableColumns,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import {
	MasterSubscriberManagementSubscribers,
	createMasterSubscriberManagementSummaryMetrics,
} from "@/app/src/data/master/subscriber-management/MasterSubscriberManagementData";
import type {
	MasterSubscriberManagementListRecord,
	MasterSubscriberManagementStatus,
	MasterSubscriberManagementTableColumnKey,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 8,
};

export function useMasterSubscriberManagementListPage() {
	const [query, setQueryState] = useState("");
	const [contactQuery, setContactQueryState] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		MasterSubscriberManagementStatus | "All"
	>("All");
	const [dateFilter, setDateFilterState] =
		useState<(typeof MasterSubscriberManagementDateFilterOptions)[number]>(
			"All Time",
		);
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const [sorting, setSorting] = useState<SortingState>([]);

	const filteredSubscribers = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		const normalizedContactQuery = contactQuery.trim().toLowerCase();

		return MasterSubscriberManagementSubscribers.filter((subscriber) => {
			const searchable = [
				subscriber.name,
				subscriber.email,
				subscriber.subscriberId,
				subscriber.status,
			]
				.join(" ")
				.toLowerCase();
			const contactSearchable = subscriber.contactNumber.toLowerCase();

			return (
				(!normalizedQuery || searchable.includes(normalizedQuery)) &&
				(!normalizedContactQuery ||
					contactSearchable.includes(normalizedContactQuery)) &&
				(statusFilter === "All" || subscriber.status === statusFilter) &&
				matchesDateFilter(subscriber.dateRegistered, dateFilter)
			);
		});
	}, [contactQuery, dateFilter, query, statusFilter]);

	const columns = useMemo<
		ColumnDef<MasterSubscriberManagementListRecord>[]
	>(
		() =>
			MasterSubscriberManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						enableSorting: false,
						header: column.label,
						id: "actions",
						meta: { className: column.className },
					};
				}

				return createColumn(
					column.key,
					column.label,
					column.className,
					column.sortable,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: filteredSubscribers,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		state: {
			pagination,
			sorting,
		},
	});

	const metrics = useMemo(createMasterSubscriberManagementSummaryMetrics, []);

	function setQuery(value: string) {
		setQueryState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setContactQuery(value: string) {
		setContactQueryState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setStatusFilter(value: MasterSubscriberManagementStatus | "All") {
		setStatusFilterState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setDateFilter(
		value: (typeof MasterSubscriberManagementDateFilterOptions)[number],
	) {
		setDateFilterState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function resetFilters() {
		setQuery("");
		setContactQuery("");
		setStatusFilter("All");
		setDateFilter("All Time");
	}

	return {
		contactQuery,
		dateFilter,
		dateOptions: MasterSubscriberManagementDateFilterOptions,
		metrics,
		query,
		resetFilters,
		setContactQuery,
		setDateFilter,
		setQuery,
		setStatusFilter,
		statusFilter,
		statusOptions: MasterSubscriberManagementStatusOptions,
		table,
	};
}

function createColumn(
	key: MasterSubscriberManagementTableColumnKey,
	label: string,
	className: string,
	sortable: boolean,
): ColumnDef<MasterSubscriberManagementListRecord> {
	return {
		accessorKey: key,
		enableSorting: sortable,
		header: label,
		meta: { className },
	};
}

function matchesDateFilter(
	dateRegistered: string,
	dateFilter: (typeof MasterSubscriberManagementDateFilterOptions)[number],
) {
	if (dateFilter === "All Time") {
		return true;
	}

	const registeredAt = new Date(`${dateRegistered}T00:00:00`).getTime();
	const maxDate = new Date("2024-05-15T00:00:00").getTime();

	if (dateFilter === "Last 7 Days") {
		return registeredAt >= maxDate - 7 * 24 * 60 * 60 * 1000;
	}

	if (dateFilter === "Last 30 Days") {
		return registeredAt >= maxDate - 30 * 24 * 60 * 60 * 1000;
	}

	return new Date(`${dateRegistered}T00:00:00`).getFullYear() === 2024;
}
