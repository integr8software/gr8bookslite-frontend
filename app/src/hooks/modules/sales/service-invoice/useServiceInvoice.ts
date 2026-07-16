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
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
	createBlankServiceInvoiceLineEntry,
	createServiceInvoiceFormValues,
	createServiceInvoiceFormValuesFromRecord,
	createServiceInvoiceRecordFromForm,
	getInitialServiceInvoices,
	writeStoredServiceInvoices,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import { ServiceInvoiceStatusFilters } from "@/app/src/constants/modules/sales/service-invoice/ServiceInvoiceConstants";
import type {
	ServiceInvoiceActionMode,
	ServiceInvoiceFormValues,
	ServiceInvoiceLineEntry,
	ServiceInvoiceRecord,
	ServiceInvoiceStatus,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import { validateServiceInvoiceForm } from "@/app/src/validations/modules/sales/service-invoice/ServiceInvoiceValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type ServiceInvoiceStoreState = {
	isLoading: boolean;
	invoices: ServiceInvoiceRecord[];
	lastSyncedAt: number;
	updateInvoiceStatus: (
		invoice: ServiceInvoiceRecord,
		status: ServiceInvoiceStatus,
	) => void;
};

export function useServiceInvoiceStore<TSelected = ServiceInvoiceStoreState>(
	selector?: (state: ServiceInvoiceStoreState) => TSelected,
) {
	const [invoices, setInvoices] = useState(getInitialServiceInvoices);
	const [lastSyncedAt] = useState(() => Date.now());
	const updateInvoiceStatus = useCallback(
		(invoice: ServiceInvoiceRecord, status: ServiceInvoiceStatus) => {
			setInvoices((currentInvoices) =>
				persistServiceInvoices(
					currentInvoices.map((currentInvoice) =>
						currentInvoice.id === invoice.id
							? {
									...currentInvoice,
									formValues: currentInvoice.formValues
										? {
												...currentInvoice.formValues,
												status,
											}
										: currentInvoice.formValues,
									status,
								}
							: currentInvoice,
					),
				),
			);
			toast.success(`Service invoice marked as ${status}.`);
		},
		[],
	);
	const state = useMemo<ServiceInvoiceStoreState>(
		() => ({
			isLoading: false,
			invoices,
			lastSyncedAt,
			updateInvoiceStatus,
		}),
		[invoices, lastSyncedAt, updateInvoiceStatus],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function useServiceInvoiceActionForm(
	mode: ServiceInvoiceActionMode,
	recordId?: string,
	onSaved?: (record: ServiceInvoiceRecord) => void,
) {
	const initialRecord =
		mode === "add"
			? null
			: getInitialServiceInvoices().find((invoice) => invoice.id === recordId) ??
				null;
	const [loadedRecord, setLoadedRecord] = useState<ServiceInvoiceRecord | null>(
		initialRecord,
	);
	const [values, setValues] = useState<ServiceInvoiceFormValues>(() =>
		initialRecord
			? createServiceInvoiceFormValuesFromRecord(initialRecord)
			: createServiceInvoiceFormValues(),
	);

	function updateField<Key extends keyof ServiceInvoiceFormValues>(
		key: Key,
		value: ServiceInvoiceFormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function updateLineEntries(lineEntries: ServiceInvoiceLineEntry[]) {
		setValues((current) => ({
			...current,
			...calculateHeaderAmounts(lineEntries),
			lineEntries,
		}));
	}

	function submitInvoice() {
		const validation = validateServiceInvoiceForm(values);

		if (!validation.isValid) {
			toast.error(validation.message ?? "Review the service invoice details.");
			return;
		}

		const nextRecord = createServiceInvoiceRecordFromForm(
			values,
			mode === "edit" ? loadedRecord ?? undefined : undefined,
		);
		const nextInvoices = upsertServiceInvoiceRecord(nextRecord);

		writeStoredServiceInvoices(nextInvoices);
		setLoadedRecord(nextRecord);
		toast.success(
			mode === "edit" ? "Service invoice updated." : "Service invoice saved.",
		);
		onSaved?.(nextRecord);
	}

	return {
		isRecordMissing: mode !== "add" && !initialRecord,
		submitInvoice,
		updateField,
		updateLineEntries,
		values,
	};
}

export function useServiceInvoiceTable(invoices: ServiceInvoiceRecord[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [dateRange, setDateRangeState] = useState<DateRangeValue>({
		from: "",
		to: "",
	});
	const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({
		from: "",
		to: "",
	});
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "documentDate", desc: true },
	]);
	const [statusFilter, setStatusFilterState] = useState<
		(typeof ServiceInvoiceStatusFilters)[number]
	>("all");
	const deferredQuery = useDeferredValue(query);
	const filteredRows = useMemo(
		() =>
			invoices.filter((invoice) => {
				const searchable = [
					invoice.transactionNo,
					invoice.invoiceNo,
					invoice.customerCode,
					invoice.customerName,
					invoice.referenceNo,
				]
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(deferredQuery.toLowerCase()) &&
					(statusFilter === "all" || invoice.status === statusFilter) &&
					isDateInRange(invoice.documentDate, dateRange) &&
					isAmountInRange(invoice.amount, amountRange)
				);
			}),
		[amountRange, dateRange, deferredQuery, invoices, statusFilter],
	);
	const columns = useMemo<ColumnDef<ServiceInvoiceRecord>[]>(
		() => [
			{
				id: "transactionNo",
				accessorKey: "transactionNo",
				header: "Trans No.",
				sortingFn: "alphanumeric",
				meta: { className: "w-[12rem]" },
			},
			{
				id: "documentDate",
				accessorKey: "documentDate",
				header: "Document Date",
				sortingFn: "datetime",
				meta: { className: "w-[10rem]" },
			},
			{
				id: "customerName",
				accessorKey: "customerName",
				header: "Customer Name",
				sortingFn: "alphanumeric",
				meta: { className: "w-[18rem]" },
			},
			{
				id: "invoiceNo",
				accessorKey: "invoiceNo",
				header: "Invoice No.",
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
				id: "amount",
				accessorKey: "amount",
				header: "Gross Amount",
				sortingFn: "basic",
				meta: { className: "w-[11rem]" },
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

	function setStatusFilter(
		value: (typeof ServiceInvoiceStatusFilters)[number],
	) {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	function setDateRange(value: DateRangeValue) {
		setDateRangeState(value);
		table.setPageIndex(0);
	}

	function setAmountRange(value: AmountRangeValue) {
		setAmountRangeState(value);
		table.setPageIndex(0);
	}

	function resetFilters() {
		setQueryState("");
		setDateRangeState({ from: "", to: "" });
		setAmountRangeState({ from: "", to: "" });
		setStatusFilterState("all");
		table.setPageIndex(0);
	}

	return {
		amountRange,
		dateRange,
		query,
		resetFilters,
		setAmountRange,
		setDateRange,
		setQuery,
		setStatusFilter,
		statusFilter,
		table,
	};
}

function calculateHeaderAmounts(lineEntries: ServiceInvoiceLineEntry[]) {
	const totals = lineEntries.reduce(
		(summary, entry) => ({
			discountAmount:
				summary.discountAmount + parseMoneyNumberInput(entry.discountAmount),
			ewtAmount: summary.ewtAmount + parseMoneyNumberInput(entry.ewtAmount),
			grossAmount:
				summary.grossAmount + parseMoneyNumberInput(entry.grossAmount),
			netAmount: summary.netAmount + parseMoneyNumberInput(entry.netAmount),
			vatAmount: summary.vatAmount + parseMoneyNumberInput(entry.vatAmount),
			wvatAmount: summary.wvatAmount + parseMoneyNumberInput(entry.wvatAmount),
		}),
		{
			discountAmount: 0,
			ewtAmount: 0,
			grossAmount: 0,
			netAmount: 0,
			vatAmount: 0,
			wvatAmount: 0,
		},
	);

	return {
		discountAmount: totals.discountAmount.toFixed(2),
		ewtAmount: totals.ewtAmount.toFixed(2),
		grossAmount: totals.grossAmount.toFixed(2),
		netAmount: totals.netAmount.toFixed(2),
		vatAmount: totals.vatAmount.toFixed(2),
		wvatAmount: totals.wvatAmount.toFixed(2),
	};
}

function persistServiceInvoices(invoices: ServiceInvoiceRecord[]) {
	writeStoredServiceInvoices(invoices);

	return invoices;
}

function upsertServiceInvoiceRecord(record: ServiceInvoiceRecord) {
	const currentInvoices = getInitialServiceInvoices();
	const existingIndex = currentInvoices.findIndex(
		(invoice) => invoice.id === record.id,
	);

	if (existingIndex === -1) {
		return persistServiceInvoices([record, ...currentInvoices]);
	}

	return persistServiceInvoices(
		currentInvoices.map((invoice) =>
			invoice.id === record.id ? record : invoice,
		),
	);
}

function isAmountInRange(value: number, range: AmountRangeValue) {
	const fromAmount = range.from.trim() ? parseMoneyNumberInput(range.from) : 0;
	const toAmount = range.to.trim()
		? parseMoneyNumberInput(range.to)
		: Number.MAX_SAFE_INTEGER;

	return value >= fromAmount && value <= toAmount;
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

export { createBlankServiceInvoiceLineEntry };
