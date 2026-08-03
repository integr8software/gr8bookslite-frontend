"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
	createBlankPickListLineEntry,
	createPickListFormValues,
	createPickListFormValuesFromRecord,
	createPickListRecordFromForm,
	getInitialPickLists,
	PickListSalesOrderCopyRecords,
	writeStoredPickLists,
} from "@/app/src/data/modules/inventory/pick-list/PickListData";
import { PickListStatusFilters } from "@/app/src/constants/modules/inventory/pick-list/PickListConstants";
import type {
	PickListActionMode,
	PickListFormValues,
	PickListLineEntry,
	PickListRecord,
	PickListStatus,
} from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import { validatePickListForm } from "@/app/src/validations/modules/inventory/pick-list/PickListValidation";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type PickListStoreState = {
	isLoading: boolean;
	lastSyncedAt: number;
	pickLists: PickListRecord[];
	updatePickListStatus: (
		pickList: PickListRecord,
		status: PickListStatus,
	) => void;
};

export function usePickListStore<TSelected = PickListStoreState>(
	selector?: (state: PickListStoreState) => TSelected,
) {
	const [pickLists, setPickLists] = useState(getInitialPickLists);
	const [lastSyncedAt] = useState(() => Date.now());
	const updatePickListStatus = useCallback(
		(pickList: PickListRecord, status: PickListStatus) => {
			setPickLists((currentPickLists) =>
				persistPickLists(
					currentPickLists.map((currentPickList) =>
						currentPickList.id === pickList.id
							? {
									...currentPickList,
									formValues: currentPickList.formValues
										? {
												...currentPickList.formValues,
												status,
											}
										: currentPickList.formValues,
									status,
								}
							: currentPickList,
					),
				),
			);
			toast.success(`Pick list marked as ${status}.`);
		},
		[],
	);
	const state = useMemo<PickListStoreState>(
		() => ({
			isLoading: false,
			lastSyncedAt,
			pickLists,
			updatePickListStatus,
		}),
		[lastSyncedAt, pickLists, updatePickListStatus],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function usePickListActionForm(
	mode: PickListActionMode,
	recordId?: string,
	onSaved?: (record: PickListRecord) => void,
) {
	const initialRecord =
		mode === "add"
			? null
			: getInitialPickLists().find((pickList) => pickList.id === recordId) ??
				null;
	const [loadedRecord, setLoadedRecord] = useState<PickListRecord | null>(
		initialRecord,
	);
	const [values, setValues] = useState<PickListFormValues>(() =>
		initialRecord
			? createPickListFormValuesFromRecord(initialRecord)
			: createPickListFormValues(),
	);

	function updateField<Key extends keyof PickListFormValues>(
		key: Key,
		value: PickListFormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function updateLineEntries(lineEntries: PickListLineEntry[]) {
		setValues((current) => ({ ...current, lineEntries }));
	}

	function copyFromSalesOrders(recordIds: string[]) {
		const selectedOrders = PickListSalesOrderCopyRecords.filter((record) =>
			recordIds.includes(record.id),
		);

		if (selectedOrders.length === 0) {
			toast.error("Select at least one sales order to copy.");
			return;
		}

		const firstOrder = selectedOrders[0];

		setValues((current) => ({
			...current,
			documentDate: firstOrder.documentDate || current.documentDate,
			partyCode: firstOrder.customerCode || current.partyCode,
			partyName: firstOrder.customerName || current.partyName,
			lineEntries: selectedOrders.map((order) =>
				createBlankPickListLineEntry({
					soNo: order.referenceNo,
					itemCode: "ITEM-001",
					itemName: order.remarks || "Inventory item",
					soQuantity: "0.00",
					plQuantity: "1000.00",
					uom: "PCS",
				}),
			),
		}));
		toast.success("Sales order copied to pick list.");
	}

	function submitPickList() {
		const validation = validatePickListForm(values);

		if (!validation.isValid) {
			toast.error(validation.message ?? "Review the pick list details.");
			return;
		}

		const nextRecord = createPickListRecordFromForm(
			values,
			mode === "edit" ? loadedRecord ?? undefined : undefined,
		);
		const nextPickLists = upsertPickListRecord(nextRecord);

		writeStoredPickLists(nextPickLists);
		setLoadedRecord(nextRecord);
		toast.success(mode === "edit" ? "Pick list updated." : "Pick list saved.");
		onSaved?.(nextRecord);
	}

	return {
		copyFromSalesOrders,
		isRecordMissing: mode !== "add" && !initialRecord,
		submitPickList,
		updateField,
		updateLineEntries,
		values,
	};
}

export function usePickListTable(pickLists: PickListRecord[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [dateRange, setDateRangeState] = useState<DateRangeValue>({
		from: "",
		to: "",
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "deliveryDate", desc: true },
	]);
	const [statusFilter, setStatusFilterState] = useState<
		(typeof PickListStatusFilters)[number]
	>("all");
	const deferredQuery = useDeferredValue(query);
	const filteredRows = useMemo(
		() =>
			pickLists.filter((pickList) => {
				const searchable = [
					pickList.transactionNo,
					pickList.referenceNo,
					pickList.cluster,
				]
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(deferredQuery.toLowerCase()) &&
					(statusFilter === "all" || pickList.status === statusFilter) &&
					isDateInRange(pickList.documentDate, dateRange)
				);
			}),
		[dateRange, deferredQuery, pickLists, statusFilter],
	);
	const columns = useMemo<ColumnDef<PickListRecord>[]>(
		() => [
			{
				id: "transactionNo",
				accessorKey: "transactionNo",
				header: "Trans No.",
				sortingFn: "alphanumeric",
				meta: { className: "w-[12rem]" },
			},
			{
				id: "deliveryDate",
				accessorKey: "deliveryDate",
				header: "Delivery Date",
				sortingFn: "datetime",
				meta: { className: "w-[10rem]" },
			},
			{
				id: "cluster",
				accessorKey: "cluster",
				header: "Cluster",
				sortingFn: "alphanumeric",
				meta: { className: "w-[12rem]" },
			},
			{
				id: "referenceNo",
				accessorKey: "referenceNo",
				header: "Reference No.",
				sortingFn: "alphanumeric",
				meta: { className: "w-[12rem]" },
			},
			{
				id: "totalLines",
				accessorKey: "totalLines",
				header: "Lines",
				sortingFn: "basic",
				meta: { className: "w-[8rem]" },
			},
			{
				id: "status",
				accessorKey: "status",
				header: "Status",
				sortingFn: "alphanumeric",
				meta: { className: "w-[10rem]" },
			},
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[9rem] text-center" },
			},
		],
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
	const table = useReactTable({
		data: filteredRows,
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

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setDateRange(value: DateRangeValue) {
		setDateRangeState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: (typeof PickListStatusFilters)[number]) {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	function resetFilters() {
		setQueryState("");
		setDateRangeState({ from: "", to: "" });
		setStatusFilterState("all");
		table.setPageIndex(0);
	}

	return {
		dateRange,
		query,
		resetFilters,
		setDateRange,
		setQuery,
		setStatusFilter,
		statusFilter,
		table,
	};
}

function persistPickLists(pickLists: PickListRecord[]) {
	writeStoredPickLists(pickLists);

	return pickLists;
}

function upsertPickListRecord(record: PickListRecord) {
	const currentPickLists = getInitialPickLists();
	const existingIndex = currentPickLists.findIndex(
		(pickList) => pickList.id === record.id,
	);

	if (existingIndex === -1) {
		return persistPickLists([record, ...currentPickLists]);
	}

	return persistPickLists(
		currentPickLists.map((pickList) =>
			pickList.id === record.id ? record : pickList,
		),
	);
}

function isDateInRange(value: string, range: DateRangeValue) {
	if (!range.from && !range.to) {
		return true;
	}

	const dateTime = new Date(value).setHours(0, 0, 0, 0);
	const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
	const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

	return !(
		(fromTime !== null && dateTime < fromTime) ||
		(toTime !== null && dateTime > toTime)
	);
}
