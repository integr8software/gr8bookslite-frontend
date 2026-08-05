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
	createBlankDeliveryReceiptLineEntry,
	createDeliveryReceiptFormValues,
	createDeliveryReceiptFormValuesFromRecord,
	createDeliveryReceiptRecordFromForm,
	getInitialDeliveryReceipts,
	writeStoredDeliveryReceipts,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import {
	createPickListFormValuesFromRecord,
	getInitialPickLists,
} from "@/app/src/data/modules/inventory/pick-list/PickListData";
import { DeliveryReceiptStatusFilters } from "@/app/src/constants/modules/inventory/delivery-receipt/DeliveryReceiptConstants";
import type {
	DeliveryReceiptActionMode,
	DeliveryReceiptAccountingEntry,
	DeliveryReceiptFormValues,
	DeliveryReceiptLineEntry,
	DeliveryReceiptRecord,
	DeliveryReceiptStatus,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import { validateDeliveryReceiptForm } from "@/app/src/validations/modules/inventory/delivery-receipt/DeliveryReceiptValidation";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type DeliveryReceiptStoreState = {
	isLoading: boolean;
	lastSyncedAt: number;
	receipts: DeliveryReceiptRecord[];
	updateReceiptStatus: (
		receipt: DeliveryReceiptRecord,
		status: DeliveryReceiptStatus,
	) => void;
};

export function useDeliveryReceiptStore<TSelected = DeliveryReceiptStoreState>(
	selector?: (state: DeliveryReceiptStoreState) => TSelected,
) {
	const [receipts, setReceipts] = useState(getInitialDeliveryReceipts);
	const [lastSyncedAt] = useState(() => Date.now());
	const updateReceiptStatus = useCallback(
		(receipt: DeliveryReceiptRecord, status: DeliveryReceiptStatus) => {
			setReceipts((currentReceipts) =>
				persistDeliveryReceipts(
					currentReceipts.map((currentReceipt) =>
						currentReceipt.id === receipt.id
							? {
									...currentReceipt,
									formValues: currentReceipt.formValues
										? {
												...currentReceipt.formValues,
												status,
											}
										: currentReceipt.formValues,
									status,
								}
							: currentReceipt,
					),
				),
			);
			toast.success(`Delivery receipt marked as ${status}.`);
		},
		[],
	);
	const state = useMemo<DeliveryReceiptStoreState>(
		() => ({
			isLoading: false,
			lastSyncedAt,
			receipts,
			updateReceiptStatus,
		}),
		[lastSyncedAt, receipts, updateReceiptStatus],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function useDeliveryReceiptActionForm(
	mode: DeliveryReceiptActionMode,
	recordId?: string,
	onSaved?: (record: DeliveryReceiptRecord) => void,
) {
	const initialRecord =
		mode === "add"
			? null
			: getInitialDeliveryReceipts().find(
					(receipt) => receipt.id === recordId,
				) ?? null;
	const [loadedRecord, setLoadedRecord] =
		useState<DeliveryReceiptRecord | null>(initialRecord);
	const [values, setValues] = useState<DeliveryReceiptFormValues>(() =>
		initialRecord
			? createDeliveryReceiptFormValuesFromRecord(initialRecord)
			: createDeliveryReceiptFormValues(),
	);

	function updateField<Key extends keyof DeliveryReceiptFormValues>(
		key: Key,
		value: DeliveryReceiptFormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function updateLineEntries(lineEntries: DeliveryReceiptLineEntry[]) {
		setValues((current) => ({ ...current, lineEntries }));
	}

	function updateAccountingEntries(accountingEntries: DeliveryReceiptAccountingEntry[]) {
		setValues((current) => ({ ...current, accountingEntries }));
	}

	function copyFromPickLists(recordIds: string[]) {
		const selectedPickLists = getInitialPickLists().filter((pickList) =>
			recordIds.includes(pickList.id),
		);

		if (selectedPickLists.length === 0) {
			toast.error("Select at least one pick list to copy.");
			return;
		}

		const pickListValues = selectedPickLists.map(createPickListFormValuesFromRecord);
		const pickListLines = pickListValues.flatMap((pickList) =>
			pickList.lineEntries.filter(
				(lineEntry) =>
					lineEntry.soNo.trim() ||
					lineEntry.itemCode.trim() ||
					lineEntry.itemName.trim() ||
					lineEntry.plQuantity.trim(),
			),
		);
		const firstPickList = pickListValues[0];

		setValues((current) => ({
			...current,
			deliveryDate: firstPickList.deliveryDate || current.deliveryDate,
			documentDate: firstPickList.documentDate || current.documentDate,
			driverName: firstPickList.driverName || current.driverName,
			plateNo: firstPickList.plateNo || current.plateNo,
			remarks: firstPickList.remarks || current.remarks,
			soNo:
				pickListLines.find((lineEntry) => lineEntry.soNo.trim())?.soNo ||
				current.soNo,
			vceCode: firstPickList.partyCode || current.vceCode,
			vceName: firstPickList.partyName || current.vceName,
			billToCode: firstPickList.partyCode || current.billToCode,
			billToName: firstPickList.partyName || current.billToName,
			lineEntries:
				pickListLines.length > 0
					? pickListLines.map((lineEntry) =>
							createBlankDeliveryReceiptLineEntry({
								itemCode: lineEntry.itemCode,
								barcode: lineEntry.barcode,
								name: lineEntry.itemName,
								description: lineEntry.soNo,
								quantity: lineEntry.plQuantity,
								uom: lineEntry.uom,
								expirationDate: lineEntry.expirationDate,
								lotNo: lineEntry.lotNo,
								color: lineEntry.color,
								brand: lineEntry.brand,
								size: lineEntry.size,
								model: lineEntry.model,
								binNo: lineEntry.binNo,
							}),
						)
					: current.lineEntries,
		}));
		toast.success("Pick list copied to delivery receipt.");
	}

	function submitReceipt() {
		const validation = validateDeliveryReceiptForm(values);

		if (!validation.isValid) {
			toast.error(validation.message ?? "Review the delivery receipt details.");
			return;
		}

		const nextRecord = createDeliveryReceiptRecordFromForm(
			values,
			mode === "edit" ? loadedRecord ?? undefined : undefined,
		);
		const nextReceipts = upsertDeliveryReceiptRecord(nextRecord);

		writeStoredDeliveryReceipts(nextReceipts);
		setLoadedRecord(nextRecord);
		toast.success(
			mode === "edit"
				? "Delivery receipt updated."
				: "Delivery receipt saved.",
		);
		onSaved?.(nextRecord);
	}

	return {
		copyFromPickLists,
		isRecordMissing: mode !== "add" && !initialRecord,
		submitReceipt,
		updateField,
		updateAccountingEntries,
		updateLineEntries,
		values,
	};
}

export function useDeliveryReceiptTable(receipts: DeliveryReceiptRecord[]) {
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
		(typeof DeliveryReceiptStatusFilters)[number]
	>("all");
	const deferredQuery = useDeferredValue(query);
	const filteredRows = useMemo(
		() =>
			receipts.filter((receipt) => {
				const searchable = [
					receipt.transactionNo,
					receipt.customerCode,
					receipt.customerName,
					receipt.referenceNo,
				]
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(deferredQuery.toLowerCase()) &&
					(statusFilter === "all" || receipt.status === statusFilter) &&
					isDateInRange(receipt.documentDate, dateRange)
				);
			}),
		[dateRange, deferredQuery, receipts, statusFilter],
	);
	const columns = useMemo<ColumnDef<DeliveryReceiptRecord>[]>(
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
				id: "customerName",
				accessorKey: "customerName",
				header: "Party Name",
				sortingFn: "alphanumeric",
				meta: { className: "w-[18rem]" },
			},
			{
				id: "referenceNo",
				accessorKey: "referenceNo",
				header: "Reference No.",
				sortingFn: "alphanumeric",
				meta: { className: "w-[12rem]" },
			},
			{
				id: "totalQuantity",
				accessorKey: "totalQuantity",
				header: "Total Qty",
				sortingFn: "basic",
				meta: { className: "w-[10rem]" },
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

	function setStatusFilter(
		value: (typeof DeliveryReceiptStatusFilters)[number],
	) {
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

function persistDeliveryReceipts(receipts: DeliveryReceiptRecord[]) {
	writeStoredDeliveryReceipts(receipts);

	return receipts;
}

function upsertDeliveryReceiptRecord(record: DeliveryReceiptRecord) {
	const currentReceipts = getInitialDeliveryReceipts();
	const existingIndex = currentReceipts.findIndex(
		(receipt) => receipt.id === record.id,
	);

	if (existingIndex === -1) {
		return persistDeliveryReceipts([record, ...currentReceipts]);
	}

	return persistDeliveryReceipts(
		currentReceipts.map((receipt) =>
			receipt.id === record.id ? record : receipt,
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

export { createBlankDeliveryReceiptLineEntry };
