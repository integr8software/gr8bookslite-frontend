"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import { WorkspaceVoucherCouponPromotionTableColumns } from "@/app/src/constants/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionConstants";
import {
	WorkspaceVoucherCouponPromotionRecords,
	formatWorkspaceVoucherCouponPromotionDate,
	formatWorkspaceVoucherCouponPromotionExpiry,
	formatWorkspaceVoucherCouponPromotionValue,
	getWorkspaceVoucherCouponPromotionSummary,
} from "@/app/src/data/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionData";
import type {
	WorkspaceVoucherCouponPromotionRecord,
	WorkspaceVoucherCouponPromotionStatusFilter,
	WorkspaceVoucherCouponPromotionTableColumnKey,
	WorkspaceVoucherCouponPromotionTypeFilter,
} from "@/app/src/types/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

export function useWorkspaceVoucherCouponPromotionPage() {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<WorkspaceVoucherCouponPromotionStatusFilter>("All statuses");
	const [typeFilter, setTypeFilter] =
		useState<WorkspaceVoucherCouponPromotionTypeFilter>("All types");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return WorkspaceVoucherCouponPromotionRecords.filter((record) => {
			const matchesStatus =
				statusFilter === "All statuses" || record.status === statusFilter;
			const matchesType =
				typeFilter === "All types" || record.type === typeFilter;
			const matchesQuery =
				!normalizedQuery ||
				[
					record.subscriberName,
					record.ownerName,
					record.planName,
					record.promotionName,
					record.code,
					record.type,
					record.status,
					record.masterStatus,
					record.assignmentMode,
					record.grantedBy,
					record.invoiceNo,
					record.notes,
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);

			return matchesStatus && matchesType && matchesQuery;
		});
	}, [query, statusFilter, typeFilter]);
	const columns = useMemo<ColumnDef<WorkspaceVoucherCouponPromotionRecord>[]>(
		() =>
			WorkspaceVoucherCouponPromotionTableColumns.map((column) =>
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
	const summary = useMemo(
		() => getWorkspaceVoucherCouponPromotionSummary(filteredRecords),
		[filteredRecords],
	);

	function resetFilters() {
		setQuery("");
		setStatusFilter("All statuses");
		setTypeFilter("All types");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		query,
		resetFilters,
		setQuery,
		setStatusFilter,
		setTypeFilter,
		statusFilter,
		summary,
		table,
		typeFilter,
	};
}

function createColumn(
	key: WorkspaceVoucherCouponPromotionTableColumnKey,
	label: string,
	className: string,
): ColumnDef<WorkspaceVoucherCouponPromotionRecord> {
	if (key === "value") {
		return {
			id: key,
			accessorFn: (record) => formatWorkspaceVoucherCouponPromotionValue(record),
			enableSorting: false,
			header: label,
			meta: { className },
		};
	}

	if (key === "expiresAt") {
		return {
			id: key,
			accessorFn: (record) =>
				formatWorkspaceVoucherCouponPromotionExpiry(record.expiresAt),
			enableSorting: false,
			header: label,
			meta: { className },
		};
	}

	if (key === "subscriberName") {
		return {
			id: key,
			accessorFn: (record) =>
				`${record.subscriberName} ${record.ownerName} ${record.planName}`,
			enableSorting: false,
			header: label,
			meta: { className },
		};
	}

	if (key === "promotionName") {
		return {
			id: key,
			accessorFn: (record) =>
				`${record.promotionName} ${record.code} ${formatWorkspaceVoucherCouponPromotionDate(
					record.assignedAt,
				)}`,
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

