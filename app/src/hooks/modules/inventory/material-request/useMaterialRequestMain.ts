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
import { createMaterialRequestStatusHistoryEntry } from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import {
	canApproveMaterialRequestStatus,
	canCancelMaterialRequestStatus,
	canDisapproveMaterialRequestStatus,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";

export function useMaterialRequestMain() {
	const { deleteRequest, isLoading, isMutating, requests, updateRequest } =
		useMaterialRequestStore();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQuery] = useState("");
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
			const matchesToWarehouse =
				toWarehouseFilter === "all" ||
				request.toWarehouse === toWarehouseFilter;
			const matchesStatus =
				statusFilter === "all" || request.status === statusFilter;

			return matchesQuery && matchesToWarehouse && matchesStatus;
		});
	}, [query, requests, statusFilter, toWarehouseFilter]);

	const metrics = useMemo(() => {
		const totalRequests = requests.length;

		return {
			totalRequests,
			active: countByStatus(requests, "Active"),
			pending: countByStatus(requests, "Pending"),
			approved: countByStatus(requests, "Approved"),
			disapproved: countByStatus(requests, "Disapproved"),
			closed: countByStatus(requests, "Closed"),
		};
	}, [requests]);

	const columns = useMemo<ColumnDef<MaterialRequestRecord>[]>(
		() => [
			createColumn("requestNo", "Material Request No.", "w-[12rem]"),
			createColumn("documentDate", "Document Date", "w-[10rem]"),
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
				meta: { className: "w-[10rem] text-center" },
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
		if (status === request.status) {
			return;
		}

		if (!canUpdateMaterialRequestStatus(request.status, status)) {
			return;
		}

		updateRequest({
			...request,
			status,
			history: [
				...request.history,
				createMaterialRequestStatusHistoryEntry(status, request.requestNo),
			],
		});
	}

	return {
		filteredRequests,
		handleConfirmDelete,
		handleQueryChange,
		isLoading,
		isMutating,
		metrics,
		pendingDeleteRequest,
		query,
		resetFilters,
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

function canUpdateMaterialRequestStatus(
	currentStatus: MaterialRequestStatus,
	nextStatus: MaterialRequestStatus,
) {
	if (nextStatus === "Approved") {
		return canApproveMaterialRequestStatus(currentStatus);
	}

	if (nextStatus === "Disapproved") {
		return canDisapproveMaterialRequestStatus(currentStatus);
	}

	if (nextStatus === "Cancelled") {
		return canCancelMaterialRequestStatus(currentStatus);
	}

	if (nextStatus === "Pending") {
		return (
			currentStatus === "Approved" ||
			currentStatus === "Disapproved" ||
			currentStatus === "Cancelled"
		);
	}

	if (
		(nextStatus === "Active" || nextStatus === "Draft") &&
		(currentStatus === "Approved" || currentStatus === "Disapproved")
	) {
		return true;
	}

	if (nextStatus === "Draft" || nextStatus === "Active") {
		return currentStatus === "Cancelled";
	}

	return false;
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
