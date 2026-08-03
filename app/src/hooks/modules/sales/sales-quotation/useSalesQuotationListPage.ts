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
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import { useSalesQuotationStore } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotation";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { recordSalesQuotationAuditLog } from "@/app/src/services/modules/sales/sales-quotation/SalesQuotationAuditLog";

export function useSalesQuotationListPage() {
	const { deleteRequest, isMutating, lastSyncedAt, requests } =
		useSalesQuotationStore();
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
		useState<SalesQuotationRecord | null>(null);

	const filteredRequests = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return requests;
		}

		return requests.filter((request) =>
			[
				request.transNo,
				request.partyCode,
				request.partyName,
				request.status,
				request.projectCode,
				request.projectName,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query, requests]);
	const columns = useMemo<ColumnDef<SalesQuotationRecord>[]>(
		() => [
			createColumn("transNo", "PR No.", "w-[9rem]"),
			createColumn("partyName", "Party", "w-[18rem]"),
			createColumn("prDate", "Date", "w-[10rem]"),
			createColumn("status", "Status", "w-[9rem]"),
			{
				id: "grossAmount",
				header: "Gross Amount",
				accessorFn: (request) =>
					request.items.reduce(
						(total, item) => total + item.quantity * item.itemPrice,
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
		recordSalesQuotationAuditLog("DELETE", pendingDeleteRequest, {
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
		lastSyncedAt,
		pendingDeleteRequest,
		query,
		setPendingDeleteRequest,
		table,
	};
}

function createColumn(
	key: keyof SalesQuotationRecord,
	header: string,
	className: string,
): ColumnDef<SalesQuotationRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: key === "prDate" ? "datetime" : "alphanumeric",
		meta: { className },
	};
}
