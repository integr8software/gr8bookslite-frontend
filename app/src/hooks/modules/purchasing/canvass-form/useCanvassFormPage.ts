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
import { useCanvassFormStore } from "@/app/src/hooks/modules/purchasing/canvass-form/useCanvassForm";
import type { CanvassFormRecord } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";

export function useCanvassFormListPage() {
	const { deleteForm, forms, isMutating, lastSyncedAt } = useCanvassFormStore();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQuery] = useState("");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "documentDate", desc: true },
	]);
	const [pendingDeleteForm, setPendingDeleteForm] =
		useState<CanvassFormRecord | null>(null);
	const filteredForms = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return forms;
		return forms.filter((form) =>
			[
				form.transNo,
				form.purchaseType,
				form.requestedBy,
				form.responsibilityCenter,
				form.status,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [forms, query]);
	const columns = useMemo<ColumnDef<CanvassFormRecord>[]>(
		() => [
			createColumn("transNo", "Trans No.", "w-[11rem]"),
			createColumn("documentDate", "Document Date", "w-[10rem]"),
			createColumn("requestedBy", "Requested By", "w-[16rem]"),
			createColumn("purchaseType", "Type", "w-[9rem]"),
			createColumn("status", "Status", "w-[9rem]"),
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
		data: filteredForms,
		columns,
		state: { pagination, sorting },
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
		if (!pendingDeleteForm) return;
		deleteForm(pendingDeleteForm.id);
		setPendingDeleteForm(null);
	}

	return {
		handleConfirmDelete,
		handleQueryChange,
		isMutating,
		lastSyncedAt,
		pendingDeleteForm,
		query,
		setPendingDeleteForm,
		table,
	};
}

function createColumn(
	key: keyof CanvassFormRecord,
	header: string,
	className: string,
): ColumnDef<CanvassFormRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: key === "documentDate" ? "datetime" : "alphanumeric",
		meta: { className },
	};
}
