"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
	MasterPromotionTableColumns,
	getMasterPromotionTargetSummary,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import {
	MasterPromotionRecords,
	formatMasterPromotionAvailability,
	formatMasterPromotionDate,
	formatMasterPromotionLimit,
	formatMasterPromotionStartDate,
	formatMasterPromotionUsage,
	formatMasterPromotionValue,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import type {
	MasterPromotionRecord,
	MasterPromotionTableColumnKey,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

export function useMasterPromotionListPage() {
	const [records, setRecords] = useState(MasterPromotionRecords);
	const [pendingDeleteRecord, setPendingDeleteRecord] =
		useState<MasterPromotionRecord | null>(null);
	const [query, setQuery] = useState("");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return records;
		}

		return records.filter((record) =>
			[
				record.name,
				record.code,
				record.description,
				record.type,
				record.billingCycle,
				getMasterPromotionTargetSummary(record.targetPlanIds),
				record.status,
				formatMasterPromotionStartDate(record.startsAt),
				formatMasterPromotionValue(record),
				formatMasterPromotionLimit(record),
				formatMasterPromotionUsage(record),
				formatMasterPromotionDate(record.expiresAt),
				formatMasterPromotionAvailability(record),
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query, records]);
	const columns = useMemo<ColumnDef<MasterPromotionRecord>[]>(
		() =>
			MasterPromotionTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createColumn(column.key, column.label, column.className);
			}),
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: filteredRecords,
		state: {
			pagination,
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
	});
	const summary = useMemo(() => {
		const activeRecords = records.filter(
			(record) => record.status === "Active",
		).length;
		const couponRecords = records.filter(
			(record) => record.type === "Coupon",
		).length;
		const voucherRecords = records.filter(
			(record) => record.type === "Voucher",
		).length;
		const eventPromoRecords = records.filter(
			(record) => record.type === "Event Promo",
		).length;

		return {
			activeRecords,
			couponRecords,
			eventPromoRecords,
			totalRecords: records.length,
			voucherRecords,
		};
	}, [records]);

	function toggleRecordStatus(recordId: string) {
		const record = records.find((candidate) => candidate.id === recordId);

		if (!record) {
			return;
		}

		const nextStatus =
			record.status === "Active" ? "Inactive" : "Active";

		setRecords((current) =>
			current.map((candidate) =>
				candidate.id === recordId
					? { ...candidate, status: nextStatus }
					: candidate,
			),
		);
		toast.success(
			nextStatus === "Active"
				? "Promotion activated."
				: "Promotion inactivated.",
		);
	}

	function confirmDeleteRecord() {
		if (!pendingDeleteRecord) {
			return;
		}

		setRecords((current) =>
			current.filter((record) => record.id !== pendingDeleteRecord.id),
		);
		toast.success("Promotion deleted.");
		setPendingDeleteRecord(null);
	}

	function resetFilters() {
		setQuery("");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		confirmDeleteRecord,
		pendingDeleteRecord,
		query,
		resetFilters,
		setPendingDeleteRecord,
		setQuery,
		summary,
		table,
		toggleRecordStatus,
	};
}

function createColumn(
	key: MasterPromotionTableColumnKey,
	label: string,
	className: string,
): ColumnDef<MasterPromotionRecord> {
	if (key === "value") {
		return {
			id: key,
			accessorFn: (record) => formatMasterPromotionValue(record),
			header: label,
			enableSorting: false,
			meta: { className },
		};
	}

	if (key === "targetPlanIds") {
		return {
			id: key,
			accessorFn: (record) =>
				getMasterPromotionTargetSummary(record.targetPlanIds),
			header: label,
			enableSorting: false,
			meta: { className },
		};
	}

	if (key === "startsAt") {
		return {
			id: key,
			accessorFn: (record) =>
				formatMasterPromotionStartDate(record.startsAt),
			header: label,
			enableSorting: false,
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header: label,
		enableSorting: false,
		meta: { className },
	};
}
