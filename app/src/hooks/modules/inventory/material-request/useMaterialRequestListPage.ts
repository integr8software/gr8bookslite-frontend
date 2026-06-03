"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import type {
	MaterialRequestRecord,
	MaterialRequestStatus,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { useMaterialRequestStore } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequest";

export function useMaterialRequestListPage() {
	const { deleteRequest, isLoading, isMutating, requests, updateRequest } =
		useMaterialRequestStore();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQuery] = useState("");
	const [fromWarehouseFilter, setFromWarehouseFilter] = useState("all");
	const [toWarehouseFilter, setToWarehouseFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "documentDate", desc: true },
	]);
	const [pendingDeleteRequest, setPendingDeleteRequest] =
		useState<MaterialRequestRecord | null>(null);

	const filteredRequests = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return requests.filter((request) => {
			const matchesQuery =
				!normalizedQuery ||
				[
					request.requestNo,
					request.referenceNo,
					request.referenceModule,
					request.fromWarehouse,
					request.toWarehouse,
					request.department,
					request.purpose,
					request.projectName,
					request.projectRef,
					request.vceCode,
					request.vceName,
					request.status,
					...request.items.map((item) => item.itemName),
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);
			const matchesFromWarehouse =
				fromWarehouseFilter === "all" ||
				request.fromWarehouse === fromWarehouseFilter;
			const matchesToWarehouse =
				toWarehouseFilter === "all" ||
				request.toWarehouse === toWarehouseFilter;
			const matchesStatus =
				statusFilter === "all" || request.status === statusFilter;

			return (
				matchesQuery &&
				matchesFromWarehouse &&
				matchesToWarehouse &&
				matchesStatus
			);
		});
	}, [fromWarehouseFilter, query, requests, statusFilter, toWarehouseFilter]);

	const metrics = useMemo(() => {
		const totalRequests = requests.length;

		return {
			totalRequests,
			pending: countByStatus(requests, "Pending"),
			approved: countByStatus(requests, "Approved"),
			rejected: countByStatus(requests, "Rejected"),
			completed: countByStatus(requests, "Completed"),
		};
	}, [requests]);

	const columns = useMemo<ColumnDef<MaterialRequestRecord>[]>(
		() => [
			createColumn("requestNo", "Request No.", "w-[10rem]"),
			createColumn("documentDate", "Document Date", "w-[10rem]"),
			createColumn("fromWarehouse", "From Warehouse", "w-[13rem]"),
			createColumn("toWarehouse", "To Warehouse", "w-[13rem]"),
			{
				id: "materialSummary",
				header: "Material Summary",
				enableSorting: false,
				meta: { className: "w-[18rem]" },
			},
			createColumn("status", "Status", "w-[9rem]"),
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[10rem] text-right" },
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
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function resetFilters() {
		setQuery("");
		setFromWarehouseFilter("all");
		setToWarehouseFilter("all");
		setStatusFilter("all");
		table.setPageIndex(0);
	}

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleConfirmDelete() {
		if (!pendingDeleteRequest) {
			return;
		}

		deleteRequest(pendingDeleteRequest.id);
		setPendingDeleteRequest(null);
	}

	function updateRequestStatus(
		request: MaterialRequestRecord,
		status: MaterialRequestStatus,
	) {
		updateRequest({ ...request, status });
	}

	return {
		filteredRequests,
		fromWarehouseFilter,
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		metrics,
		pendingDeleteRequest,
		query,
		resetFilters,
		setFromWarehouseFilter: createFilterSetter(
			setFromWarehouseFilter,
			table.setPageIndex,
		),
		setPendingDeleteRequest,
		setStatusFilter: createFilterSetter(setStatusFilter, table.setPageIndex),
		setToWarehouseFilter: createFilterSetter(
			setToWarehouseFilter,
			table.setPageIndex,
		),
		statusFilter,
		table,
		toWarehouseFilter,
		updateRequestStatus,
	};
}

function createColumn(
	key: keyof MaterialRequestRecord,
	header: string,
	className: string,
): ColumnDef<MaterialRequestRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: key === "documentDate" ? "datetime" : "alphanumeric",
		meta: { className },
	};
}

function countByStatus(
	requests: MaterialRequestRecord[],
	status: MaterialRequestStatus,
) {
	return requests.filter((request) => request.status === status).length;
}

function createFilterSetter(
	setValue: (value: string) => void,
	setPageIndex: (pageIndex: number) => void,
) {
	return (value: string) => {
		setValue(value);
		setPageIndex(0);
	};
}
