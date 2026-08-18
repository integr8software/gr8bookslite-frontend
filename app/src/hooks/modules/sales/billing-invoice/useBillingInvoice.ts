"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
	createBlankBillingInvoiceAccountEntry,
	createBlankBillingInvoiceLineEntry,
	createBillingInvoiceFormValues,
	createBillingInvoiceFormValuesFromRecord,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import {
	BillingInvoiceStatusFilters,
	BillingInvoiceTableColumns,
} from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import type {
	BillingInvoiceActionMode,
	BillingInvoiceFormValues,
	BillingInvoiceLineEntry,
	BillingInvoiceRecord,
	BillingInvoiceStatus,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { validateBillingInvoiceForm } from "@/app/src/validations/modules/sales/billing-invoice/BillingInvoiceValidation";
import { createBillingInvoice, fetchBillingInvoice, updateBillingInvoice } from "@/app/src/services/modules/sales/billing-invoice/BillingInvoiceApi";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type BillingInvoiceStoreState = {
	isLoading: boolean;
	invoices: BillingInvoiceRecord[];
	lastSyncedAt: number;
	updateInvoiceStatus: (
		invoice: BillingInvoiceRecord,
		status: BillingInvoiceStatus,
	) => void;
};

export function useBillingInvoiceStore<TSelected = BillingInvoiceStoreState>(
	selector?: (state: BillingInvoiceStoreState) => TSelected,
) {
	const [invoices, setInvoices] = useState(getInitialBillingInvoices);
	const [lastSyncedAt] = useState(() => Date.now());
	const updateInvoiceStatus = useCallback(
		(invoice: BillingInvoiceRecord, status: BillingInvoiceStatus) => {
			setInvoices((currentInvoices) =>
				persistBillingInvoices(
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
			toast.success(`Billing invoice marked as ${status}.`);
		},
		[],
	);
	const state = useMemo<BillingInvoiceStoreState>(
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

export function useBillingInvoiceActionForm(
	mode: BillingInvoiceActionMode,
	recordId?: string,
	onSaved?: (record: BillingInvoiceRecord) => void,
) {
	const isEditOrView = mode === "edit" || mode === "view";

	const recordQuery = useQuery({
		queryKey: ["billing-invoice", recordId],
		queryFn: () => fetchBillingInvoice(recordId!),
		enabled: isEditOrView && !!recordId,
		retry: false,
	});

	const [loadedRecord, setLoadedRecord] = useState<BillingInvoiceRecord | null>(null);
	const [values, setValues] = useState<BillingInvoiceFormValues>(() =>
		createBillingInvoiceFormValues(),
	);

	useEffect(() => {
		if (recordQuery.data) {
			setLoadedRecord(recordQuery.data);
			setValues(createBillingInvoiceFormValuesFromRecord(recordQuery.data));
		}
	}, [recordQuery.data]);

	function updateField<Key extends keyof BillingInvoiceFormValues>(
		key: Key,
		value: BillingInvoiceFormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function updateLineEntries(lineEntries: BillingInvoiceLineEntry[]) {
		setValues((current) => ({
			...current,
			...calculateHeaderAmounts(lineEntries),
			lineEntries,
		}));
	}

	function submitInvoice() {
		const validation = validateBillingInvoiceForm(values);

		if (!validation.isValid) {
			toast.error(validation.message ?? "Review the billing invoice details.");
			return;
		}

		try {
			const nextRecord =
				mode === "edit" && recordId
					? await updateBillingInvoice(recordId, valuesWithDefaultAccount)
					: await createBillingInvoice(valuesWithDefaultAccount);
			setLoadedRecord(nextRecord);
			toast.success(
				mode === "edit"
					? "Billing invoice updated successfully."
					: "Billing invoice saved to the database.",
			);
			onSaved?.(nextRecord);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to save billing invoice.",
			);
		}
	}

	const isLoading = isEditOrView && recordQuery.isLoading;
	const isRecordMissing =
		isEditOrView && !recordQuery.isLoading && !recordQuery.data;

	return {
		isLoading,
		isRecordMissing,
		submitInvoice,
		updateField,
		updateLineEntries,
		values,
	};
}

export function useBillingInvoiceTable(invoices: BillingInvoiceRecord[]) {
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
		(typeof BillingInvoiceStatusFilters)[number]
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
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
	const table = useReactTable({
		data: filteredRows,
		columns: BillingInvoiceTableColumns,
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
		value: (typeof BillingInvoiceStatusFilters)[number],
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

function calculateHeaderAmounts(lineEntries: BillingInvoiceLineEntry[]) {
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

function persistBillingInvoices(invoices: BillingInvoiceRecord[]) {
	writeStoredBillingInvoices(invoices);

	return invoices;
}

function upsertBillingInvoiceRecord(record: BillingInvoiceRecord) {
	const currentInvoices = getInitialBillingInvoices();
	const existingIndex = currentInvoices.findIndex(
		(invoice) => invoice.id === record.id,
	);

	if (existingIndex === -1) {
		return persistBillingInvoices([record, ...currentInvoices]);
	}

	return persistBillingInvoices(
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

export { createBlankBillingInvoiceAccountEntry, createBlankBillingInvoiceLineEntry };

