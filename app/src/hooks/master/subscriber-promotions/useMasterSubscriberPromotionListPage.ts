"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import { MasterSubscriberPromotionTableColumns } from "@/app/src/constants/master/subscriber-promotions/MasterSubscriberPromotionConstants";
import {
	MasterSubscriberPromotionRecords,
	formatMasterSubscriberPromotionDate,
	formatMasterSubscriberPromotionExpiry,
} from "@/app/src/data/master/subscriber-promotions/MasterSubscriberPromotionData";
import type {
	MasterSubscriberPromotionAssignmentMode,
	MasterSubscriberPromotionRecord,
	MasterSubscriberPromotionStatus,
	MasterSubscriberPromotionTableColumnKey,
} from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

export type MasterSubscriberPromotionStatusFilter =
	| "All statuses"
	| MasterSubscriberPromotionStatus;

export type MasterSubscriberPromotionModeFilter =
	| "All modes"
	| MasterSubscriberPromotionAssignmentMode;

export function useMasterSubscriberPromotionListPage() {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<MasterSubscriberPromotionStatusFilter>("All statuses");
	const [modeFilter, setModeFilter] =
		useState<MasterSubscriberPromotionModeFilter>("All modes");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return MasterSubscriberPromotionRecords.filter((record) => {
			const matchesStatus =
				statusFilter === "All statuses" || record.status === statusFilter;
			const matchesMode =
				modeFilter === "All modes" || record.assignmentMode === modeFilter;
			const matchesQuery =
				!normalizedQuery ||
				[
					record.subscriberName,
					record.ownerName,
					record.planName,
					record.promotionName,
					record.promotionCode,
					record.status,
					record.assignmentMode,
					record.invoiceNo,
					record.grantedBy,
					record.notes,
					formatMasterSubscriberPromotionDate(record.assignedAt),
					formatMasterSubscriberPromotionDate(record.usedAt),
					formatMasterSubscriberPromotionExpiry(record.expiresAt),
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);

			return matchesStatus && matchesMode && matchesQuery;
		});
	}, [modeFilter, query, statusFilter]);
	const columns = useMemo<ColumnDef<MasterSubscriberPromotionRecord>[]>(
		() =>
			MasterSubscriberPromotionTableColumns.map((column) =>
				createColumn(column.key, column.label, column.className),
			),
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: filteredRecords,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination,
		},
	});
	const summary = useMemo(() => {
		const availableAssignments = MasterSubscriberPromotionRecords.filter(
			(record) => record.status === "Available",
		).length;
		const usedAssignments = MasterSubscriberPromotionRecords.filter(
			(record) => record.status === "Used",
		).length;
		const expiredAssignments = MasterSubscriberPromotionRecords.filter(
			(record) => record.status === "Expired",
		).length;
		const subscriberCount = new Set(
			MasterSubscriberPromotionRecords.map((record) => record.subscriberId),
		).size;

		return {
			availableAssignments,
			expiredAssignments,
			subscriberCount,
			totalAssignments: MasterSubscriberPromotionRecords.length,
			usedAssignments,
		};
	}, []);

	function resetFilters() {
		setQuery("");
		setStatusFilter("All statuses");
		setModeFilter("All modes");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		modeFilter,
		query,
		resetFilters,
		setModeFilter,
		setQuery,
		setStatusFilter,
		statusFilter,
		summary,
		table,
	};
}

function createColumn(
	key: MasterSubscriberPromotionTableColumnKey,
	label: string,
	className: string,
): ColumnDef<MasterSubscriberPromotionRecord> {
	if (key === "assignedAt") {
		return {
			id: key,
			accessorFn: (record) =>
				formatMasterSubscriberPromotionDate(record.assignedAt),
			enableSorting: false,
			header: label,
			meta: { className },
		};
	}

	if (key === "usedAt") {
		return {
			id: key,
			accessorFn: (record) =>
				formatMasterSubscriberPromotionDate(record.usedAt),
			enableSorting: false,
			header: label,
			meta: { className },
		};
	}

	if (key === "expiresAt") {
		return {
			id: key,
			accessorFn: (record) =>
				formatMasterSubscriberPromotionExpiry(record.expiresAt),
			enableSorting: false,
			header: label,
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		enableSorting: false,
		header: label,
		meta: { className },
	};
}
