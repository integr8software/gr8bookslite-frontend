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
	getMasterPromotionTargetLabel,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import {
	MasterPromotionRecords,
	formatMasterPromotionDate,
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
				getMasterPromotionTargetLabel(record.target),
				record.status,
				formatMasterPromotionValue(record),
				formatMasterPromotionDate(record.expiresAt),
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

	function resetFilters() {
		setQuery("");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		query,
		resetFilters,
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

	if (key === "target") {
		return {
			id: key,
			accessorFn: (record) => getMasterPromotionTargetLabel(record.target),
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
