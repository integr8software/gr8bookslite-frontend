"use client";

import { useEffect, useDeferredValue, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
	createServiceInvoiceAccountingEntries,
	createServiceInvoiceFormValues,
	createServiceInvoiceFormValuesFromRecord,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import { ServiceInvoiceStatusFilters } from "@/app/src/constants/modules/sales/service-invoice/ServiceInvoiceConstants";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	createServiceInvoice,
	fetchServiceInvoice,
	fetchServiceInvoices,
	updateServiceInvoice,
	updateServiceInvoiceStatus,
	type ServiceInvoiceListData,
} from "@/app/src/services/modules/sales/service-invoice/ServiceInvoiceApi";
import { ServiceInvoiceQueryKeys } from "@/app/src/services/modules/sales/service-invoice/ServiceInvoiceQueryKeys";
import type {
	ServiceInvoiceActionMode,
	ServiceInvoiceAccountingEntry,
	ServiceInvoiceFormValues,
	ServiceInvoiceLineEntry,
	ServiceInvoiceRecord,
	ServiceInvoiceStatus,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
	validateServiceInvoiceForm,
	type ServiceInvoiceValidationResult,
} from "@/app/src/validations/modules/sales/service-invoice/ServiceInvoiceValidation";
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
	const queryClient = useQueryClient();
	const activeBranchId = useAppStore((state) => state.activeBranchId);
	const activeCompanyId = useAppStore((state) => state.activeCompanyId);
	const recordsQuery = useQuery({
		enabled: activeCompanyId !== null && activeBranchId !== null,
		queryFn: () =>
			fetchServiceInvoices({
				branchUnitId: activeBranchId,
				limit: 500,
				sortBy: "documentDate",
				sortDirection: "desc",
			}),
		queryKey: ServiceInvoiceQueryKeys.records(activeCompanyId, activeBranchId),
		retry: false,
	});
	function refreshRecords() {
		void queryClient.invalidateQueries({
			queryKey: ServiceInvoiceQueryKeys.all(activeCompanyId, activeBranchId),
		});
	}
	const statusMutation = useMutation({
		mutationFn: ({
			recordId,
			status,
		}: {
			recordId: string;
			status: ServiceInvoiceStatus;
		}) => updateServiceInvoiceStatus({ recordId, status }),
		onSuccess: (record) => {
			refreshRecords();
			void queryClient.invalidateQueries({
				queryKey: ServiceInvoiceQueryKeys.detail(
					activeCompanyId,
					activeBranchId,
					record.id,
				),
			});
			toast.success(`Service invoice marked as ${record.status}.`);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update service invoice status. Please try again.",
			);
		},
	});
	const updateInvoiceStatus = (
		invoice: ServiceInvoiceRecord,
		status: ServiceInvoiceStatus,
	) => {
		statusMutation.mutate({ recordId: invoice.id, status });
	};
	const state = useMemo<ServiceInvoiceStoreState>(
		() => ({
			isLoading: recordsQuery.isLoading,
			invoices: recordsQuery.data?.invoices.map((invoice) => ({
				amount: invoice.grossAmount,
				customerCode: invoice.customerCode,
				customerName: invoice.customerName,
				documentDate: invoice.documentDate,
				formValues: createServiceInvoiceFormValuesFromRecord({
					amount: invoice.grossAmount,
					customerCode: invoice.customerCode,
					customerName: invoice.customerName,
					documentDate: invoice.documentDate,
					id: invoice.id,
					invoiceNo: invoice.invoiceNo ?? "",
					referenceNo: invoice.referenceNo ?? "",
					status: mapApiStatus(invoice.status),
					transactionNo: invoice.transactionNo,
				}),
				id: invoice.id,
				invoiceNo: invoice.invoiceNo ?? "",
				referenceNo: invoice.referenceNo ?? "",
				status: mapApiStatus(invoice.status),
				transactionNo: invoice.transactionNo,
			})) ?? [],
			lastSyncedAt: recordsQuery.dataUpdatedAt,
			updateInvoiceStatus,
		}),
		[recordsQuery.data?.invoices, recordsQuery.dataUpdatedAt, recordsQuery.isLoading],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function useServiceInvoiceActionForm(
	mode: ServiceInvoiceActionMode,
	recordId?: string,
	onSaved?: (record: ServiceInvoiceRecord) => void,
) {
	const queryClient = useQueryClient();
	const activeBranchId = useAppStore((state) => state.activeBranchId);
	const activeCompanyId = useAppStore((state) => state.activeCompanyId);
	const recordQuery = useQuery({
		enabled:
			mode !== "add" &&
			Boolean(recordId) &&
			activeCompanyId !== null &&
			activeBranchId !== null,
		initialData: () =>
			queryClient
				.getQueryData<ServiceInvoiceListData>(
					ServiceInvoiceQueryKeys.records(activeCompanyId, activeBranchId),
				)
				?.invoices.map((invoice) => ({
					amount: invoice.grossAmount,
					customerCode: invoice.customerCode,
					customerName: invoice.customerName,
					documentDate: invoice.documentDate,
					id: invoice.id,
					invoiceNo: invoice.invoiceNo ?? "",
					referenceNo: invoice.referenceNo ?? "",
					status: mapApiStatus(invoice.status),
					transactionNo: invoice.transactionNo,
				}))
				.find((invoice) => invoice.id === recordId),
		queryFn: () =>
			fetchServiceInvoice(recordId ?? "", {
				branchUnitId: activeBranchId,
			}),
		queryKey: ServiceInvoiceQueryKeys.detail(
			activeCompanyId,
			activeBranchId,
			recordId ?? "missing",
		),
		retry: false,
	});
	const initialRecord = mode === "add" ? null : recordQuery.data ?? null;
	const [loadedRecord, setLoadedRecord] = useState<ServiceInvoiceRecord | null>(
		initialRecord,
	);
	const [values, setValues] = useState<ServiceInvoiceFormValues>(() =>
		initialRecord
			? createServiceInvoiceFormValuesFromRecord(initialRecord)
			: createServiceInvoiceFormValues(),
	);
	const [errors, setErrors] = useState<ServiceInvoiceValidationResult>({
		isValid: true,
	});
	const saveMutation = useMutation({
		mutationFn: (nextValues: ServiceInvoiceFormValues) => {
			if (mode === "edit" && loadedRecord) {
				return updateServiceInvoice(
					{
						...loadedRecord,
						formValues: nextValues,
					},
					requireActiveBranchId(activeBranchId),
				);
			}

			return createServiceInvoice(
				nextValues,
				requireActiveBranchId(activeBranchId),
			);
		},
		onSuccess: (record) => {
			void queryClient.invalidateQueries({
				queryKey: ServiceInvoiceQueryKeys.all(activeCompanyId, activeBranchId),
			});
			void queryClient.invalidateQueries({
				queryKey: ServiceInvoiceQueryKeys.detail(
					activeCompanyId,
					activeBranchId,
					record.id,
				),
			});
			setLoadedRecord(record);
			toast.success(
				mode === "edit" ? "Service invoice updated." : "Service invoice saved.",
			);
			onSaved?.(record);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not save service invoice. Please try again.",
			);
		},
	});

	useEffect(() => {
		if (!recordQuery.data) {
			return;
		}

		setLoadedRecord(recordQuery.data);
		setValues(createServiceInvoiceFormValuesFromRecord(recordQuery.data));
		setErrors({ isValid: true });
	}, [recordQuery.data]);

	function updateField<Key extends keyof ServiceInvoiceFormValues>(
		key: Key,
		value: ServiceInvoiceFormValues[Key],
	) {
		setErrors({ isValid: true });
		setValues((current) => ({ ...current, [key]: value }));
	}

	function updateLineEntries(lineEntries: ServiceInvoiceLineEntry[]) {
		setErrors({ isValid: true });
		setValues((current) => ({
			...current,
			...calculateHeaderAmounts(lineEntries),
			accountingEntries: createServiceInvoiceAccountingEntries({
				defaultAccount: current.defaultAccount,
				lineEntries,
			}),
			lineEntries,
		}));
	}

	function updateAccountingEntries(
		accountingEntries: ServiceInvoiceAccountingEntry[],
	) {
		setErrors({ isValid: true });
		setValues((current) => ({
			...current,
			accountingEntries,
		}));
	}

	function submitInvoice() {
		const validation = validateServiceInvoiceForm(values);

		if (!validation.isValid) {
			setErrors(validation);
			toast.error(validation.message ?? "Review the service invoice details.");
			return;
		}

		setErrors({ isValid: true });
		saveMutation.mutate(values);
	}

	return {
		isRecordMissing:
			mode !== "add" &&
			recordQuery.isFetched &&
			!recordQuery.isLoading &&
			!recordQuery.data,
		submitInvoice,
		updateAccountingEntries,
		updateField,
		updateLineEntries,
		errors,
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

function mapApiStatus(status: string): ServiceInvoiceStatus {
	const statusMap: Record<string, ServiceInvoiceStatus> = {
		CANCELLED: "Cancelled",
		DISAPPROVED: "Disapproved",
		DRAFT: "Draft",
		FOR_APPROVAL: "For Approval",
		POSTED: "Posted",
	};

	return statusMap[status] ?? "Draft";
}

function requireActiveBranchId(branchUnitId: number | null) {
	if (branchUnitId === null) {
		throw new Error("Select a branch before saving service invoices.");
	}

	return branchUnitId;
}
