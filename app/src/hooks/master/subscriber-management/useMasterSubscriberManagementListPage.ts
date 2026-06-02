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
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

const EmptyRegisteredDateRange: DateRangeValue = { from: "", to: "" };
const RegisteredDateRangeReferenceDate =
	getLatestRegisteredDate(MasterSubscriberManagementSubscribers);

export function useMasterSubscriberManagementListPage() {
	const [query, setQueryState] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		MasterSubscriberManagementStatus | "All"
	>("All");
	const [registeredDateRange, setRegisteredDateRangeState] =
		useState<DateRangeValue>(EmptyRegisteredDateRange);
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const [sorting, setSorting] = useState<SortingState>([]);

	const filteredSubscribers = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return MasterSubscriberManagementSubscribers.filter((subscriber) => {
			const searchable = [
				subscriber.name,
				subscriber.email,
				subscriber.contactNumber,
				subscriber.subscriberId,
				subscriber.status,
			]
				.join(" ")
				.toLowerCase();

			return (
				(!normalizedQuery || searchable.includes(normalizedQuery)) &&
				(statusFilter === "All" || subscriber.status === statusFilter) &&
				matchesRegisteredDateRange(
					subscriber.dateRegistered,
					registeredDateRange,
				)
			);
		});
	}, [query, registeredDateRange, statusFilter]);

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

	function setStatusFilter(value: MasterSubscriberManagementStatus | "All") {
		setStatusFilterState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setRegisteredDateRange(value: DateRangeValue) {
		setRegisteredDateRangeState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function resetFilters() {
		setQuery("");
		setStatusFilter("All");
		setRegisteredDateRange(EmptyRegisteredDateRange);
	}

	return {
		metrics,
		query,
		registeredDateRange,
		registeredDateRangeReferenceDate: RegisteredDateRangeReferenceDate,
		resetFilters,
		setQuery,
		setRegisteredDateRange,
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

function matchesRegisteredDateRange(
	dateRegistered: string,
	range: DateRangeValue,
) {
	if (range.from && dateRegistered < range.from) {
		return false;
	}

	if (range.to && dateRegistered > range.to) {
		return false;
	}

	return true;
}

function getLatestRegisteredDate(records: MasterSubscriberManagementListRecord[]) {
	return records.reduce(
		(latestDate, record) =>
			record.dateRegistered > latestDate ? record.dateRegistered : latestDate,
		records[0]?.dateRegistered ?? "",
	);
}
