"use client";

import { useMemo, useState } from "react";
import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ItemPromotionsTableColumns } from "@/app/src/constants/modules/item-management/item-promotions/ItemPromotionsConstants";
import { createItemPromotionListRecords } from "@/app/src/data/modules/item-management/item-promotions/ItemPromotionsData";
import { MockItems } from "@/app/src/data/modules/item-management/items/ItemManagementData";
import { useDiscountMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/discount-maintenance/useDiscountMaintenance";
import { useItemBundles } from "@/app/src/hooks/modules/item-management/item-bundles/useItemBundles";
import { useItemPromotions } from "@/app/src/hooks/modules/item-management/item-promotions/useItemPromotions";
import type {
	ItemPromotionListRecord,
	ItemPromotionTableColumnKey,
} from "@/app/src/types/modules/item-management/item-promotions/ItemPromotionsTypes";

export function useItemPromotionsListPage() {
	const { bundles } = useItemBundles();
	const { discounts } = useDiscountMaintenanceStore();
	const {
		isLoading,
		isMutating,
		lastSyncedAt,
		promotions,
		updatePromotion,
	} = useItemPromotions();
	const [pendingStatusRow, setPendingStatusRow] =
		useState<ItemPromotionListRecord | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("Active");
	const [typeFilter, setTypeFilter] = useState("All");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const records = useMemo(
		() =>
			createItemPromotionListRecords({
				bundles,
				discounts,
				items: MockItems,
				promotions,
			}),
		[bundles, discounts, promotions],
	);
	const typeOptions = useMemo(
		() => Array.from(new Set(records.map((row) => row.type))).sort(),
		[records],
	);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return records.filter(
			(row) =>
				(statusFilter === "All" || row.status === statusFilter) &&
				(typeFilter === "All" || row.type === typeFilter) &&
				(!normalizedQuery ||
					[
						row.code,
						row.name,
						row.type,
						row.discountMaintenanceRule,
						row.item,
						row.valueLabel,
						row.validity,
						row.status,
					]
						.join(" ")
						.toLowerCase()
						.includes(normalizedQuery)),
		);
	}, [query, records, statusFilter, typeFilter]);
	const columns = useMemo<ColumnDef<ItemPromotionListRecord>[]>(
		() =>
			ItemPromotionsTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createItemPromotionColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredRecords,
		columns,
		state: { pagination, sorting },
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const activeCount = records.filter((row) => row.status === "Active").length;
	const nextPendingStatus =
		pendingStatusRow?.status === "Active" ? "Inactive" : "Active";

	function handleQueryChange(value: string) {
		setQuery(value);
		table.setPageIndex(0);
	}

	function handleStatusFilterChange(value: string) {
		setStatusFilter(value);
		table.setPageIndex(0);
	}

	function handleTypeFilterChange(value: string) {
		setTypeFilter(value);
		table.setPageIndex(0);
	}

	function resetFilters() {
		setQuery("");
		setTypeFilter("All");
		setStatusFilter("Active");
		table.setPageIndex(0);
	}

	function confirmStatusChange() {
		if (!pendingStatusRow) {
			return;
		}

		updatePromotion({
			...pendingStatusRow,
			status: nextPendingStatus,
		});
		setPendingStatusRow(null);
	}

	return {
		activeCount,
		confirmStatusChange,
		isLoading,
		isMutating,
		lastSyncedAt,
		nextPendingStatus,
		pendingStatusRow,
		query,
		records,
		resetFilters,
		setPendingStatusRow,
		statusFilter,
		table,
		typeFilter,
		typeOptions,
		handleQueryChange,
		handleStatusFilterChange,
		handleTypeFilterChange,
	};
}

function createItemPromotionColumn(
	key: ItemPromotionTableColumnKey,
	header: string,
	className: string,
): ColumnDef<ItemPromotionListRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
