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
import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import { usePurchaseRequestStore } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequest";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { recordPurchaseRequestAuditLog } from "@/app/src/services/modules/purchasing/purchase-request/PurchaseRequestAuditLog";

export function usePurchaseRequestListPage() {
	const { deleteRequest, isMutating, requests } = usePurchaseRequestStore();
	const activeBranchId = useAppStore((state) => state.activeBranchId);
	const activeBranchName = useAppStore((state) => state.activeBranchName);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQuery] = useState("");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "prDate", desc: true },
	]);
	const [pendingDeleteRequest, setPendingDeleteRequest] =
		useState<PurchaseRequestRecord | null>(null);

	const filteredRequests = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return requests;
		}

		return requests.filter((request) =>
			[
				request.transNo,
				request.vceCode,
				request.vceName,
				request.purchaseType,
				request.status,
				request.projectCode,
				request.projectName,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query, requests]);
	const columns = useMemo<ColumnDef<PurchaseRequestRecord>[]>(
		() => [
			createColumn("transNo", "PR No.", "w-[9rem]"),
			createColumn("vceName", "Supplier", "w-[18rem]"),
			createColumn("prDate", "Date", "w-[10rem]"),
			createColumn("purchaseType", "Type", "w-[9rem]"),
			createColumn("status", "Status", "w-[9rem]"),
			{
				id: "grossAmount",
				header: "Gross Amount",
				accessorFn: (request) =>
					request.items.reduce(
						(total, item) => total + item.quantity * item.cost,
						0,
					),
				sortingFn: "basic",
				meta: { className: "w-[12rem] text-right" },
			},
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[13rem]" },
			},
		],
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRequests,
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
		if (!pendingDeleteRequest) {
			return;
		}

		deleteRequest(pendingDeleteRequest.id);
		recordPurchaseRequestAuditLog("DELETE", pendingDeleteRequest, {
			branchId: activeBranchId,
			branchName: activeBranchName,
		});
		setPendingDeleteRequest(null);
	}

	return {
		filteredRequests,
		handleConfirmDelete,
		handleQueryChange,
		isMutating,
		pendingDeleteRequest,
		query,
		setPendingDeleteRequest,
		table,
	};
}

function createColumn(
	key: keyof PurchaseRequestRecord,
	header: string,
	className: string,
): ColumnDef<PurchaseRequestRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: key === "prDate" ? "datetime" : "alphanumeric",
		meta: { className },
	};
}
