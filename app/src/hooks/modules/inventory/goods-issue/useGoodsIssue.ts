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
	createGoodsIssueFormValues,
	createGoodsIssueFormValuesFromRecord,
	createGoodsIssueRecordFromForm,
	getInitialGoodsIssues,
	writeStoredGoodsIssues,
} from "@/app/src/data/modules/inventory/goods-issue/GoodsIssueData";
import { GoodsIssueStatusFilters } from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
import type {
	GoodsIssueActionMode,
	GoodsIssueFormValues,
	GoodsIssueLineEntry,
	GoodsIssueRecord,
	GoodsIssueStatus,
} from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import { validateGoodsIssueForm } from "@/app/src/validations/modules/inventory/goods-issue/GoodsIssueValidation";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

type GoodsIssueStoreState = {
	isLoading: boolean;
	issues: GoodsIssueRecord[];
	lastSyncedAt: number;
	updateIssueStatus: (
		issue: GoodsIssueRecord,
		status: GoodsIssueStatus,
	) => void;
};

export function useGoodsIssueStore<TSelected = GoodsIssueStoreState>(
	selector?: (state: GoodsIssueStoreState) => TSelected,
) {
	const [issues, setIssues] = useState(getInitialGoodsIssues);
	const [lastSyncedAt] = useState(() => Date.now());
	const updateIssueStatus = useCallback(
		(issue: GoodsIssueRecord, status: GoodsIssueStatus) => {
			setIssues((currentIssues) =>
				persistGoodsIssues(
					currentIssues.map((currentIssue) =>
						currentIssue.id === issue.id
							? {
									...currentIssue,
									formValues: currentIssue.formValues
										? { ...currentIssue.formValues, status }
										: currentIssue.formValues,
									status,
								}
							: currentIssue,
					),
				),
			);
			toast.success(`Goods issue marked as ${status}.`);
		},
		[],
	);
	const state = useMemo<GoodsIssueStoreState>(
		() => ({ isLoading: false, issues, lastSyncedAt, updateIssueStatus }),
		[issues, lastSyncedAt, updateIssueStatus],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function useGoodsIssueActionForm(
	mode: GoodsIssueActionMode,
	recordId?: string,
	onSaved?: (record: GoodsIssueRecord) => void,
) {
	const initialRecord =
		mode === "add"
			? null
			: getInitialGoodsIssues().find((issue) => issue.id === recordId) ?? null;
	const [loadedRecord, setLoadedRecord] = useState<GoodsIssueRecord | null>(
		initialRecord,
	);
	const [values, setValues] = useState<GoodsIssueFormValues>(() =>
		initialRecord
			? createGoodsIssueFormValuesFromRecord(initialRecord)
			: createGoodsIssueFormValues(),
	);

	function updateField<Key extends keyof GoodsIssueFormValues>(
		key: Key,
		value: GoodsIssueFormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function updateLineEntries(lineEntries: GoodsIssueLineEntry[]) {
		setValues((current) => ({ ...current, lineEntries }));
	}

	function submitIssue() {
		const validation = validateGoodsIssueForm(values);

		if (!validation.isValid) {
			toast.error(validation.message ?? "Review the goods issue details.");
			return;
		}

		const nextRecord = createGoodsIssueRecordFromForm(
			values,
			mode === "edit" ? loadedRecord ?? undefined : undefined,
		);
		const nextIssues = upsertGoodsIssueRecord(nextRecord);

		writeStoredGoodsIssues(nextIssues);
		setLoadedRecord(nextRecord);
		toast.success(mode === "edit" ? "Goods issue updated." : "Goods issue saved.");
		onSaved?.(nextRecord);
	}

	return {
		isRecordMissing: mode !== "add" && !initialRecord,
		submitIssue,
		updateField,
		updateLineEntries,
		values,
	};
}

export function useGoodsIssueTable(issues: GoodsIssueRecord[]) {
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
		(typeof GoodsIssueStatusFilters)[number]
	>("all");
	const deferredQuery = useDeferredValue(query);
	const filteredRows = useMemo(
		() =>
			issues.filter((issue) => {
				const searchable = [
					issue.transactionNo,
					issue.transactionType,
					issue.referenceNo,
					issue.vceName,
				]
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(deferredQuery.toLowerCase()) &&
					(statusFilter === "all" || issue.status === statusFilter) &&
					isDateInRange(issue.documentDate, dateRange) &&
					isAmountInRange(issue.totalAmount, amountRange)
				);
			}),
		[amountRange, dateRange, deferredQuery, issues, statusFilter],
	);
	const columns = useMemo<ColumnDef<GoodsIssueRecord>[]>(
		() => [
			{
				id: "transactionNo",
				accessorKey: "transactionNo",
				header: "GI No.",
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
				id: "transactionType",
				accessorKey: "transactionType",
				header: "Transaction Type",
				sortingFn: "alphanumeric",
				meta: { className: "w-[16rem]" },
			},
			{
				id: "vceName",
				accessorKey: "vceName",
				header: "Party Code",
				sortingFn: "alphanumeric",
				meta: { className: "w-[16rem]" },
			},
			{
				id: "referenceNo",
				accessorKey: "referenceNo",
				header: "Reference No.",
				sortingFn: "alphanumeric",
				meta: { className: "w-[12rem]" },
			},
			{
				id: "totalAmount",
				accessorKey: "totalAmount",
				header: "Amount",
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
		state: { pagination, sorting },
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

	function setAmountRange(value: AmountRangeValue) {
		setAmountRangeState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: (typeof GoodsIssueStatusFilters)[number]) {
		setStatusFilterState(value);
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

function persistGoodsIssues(issues: GoodsIssueRecord[]) {
	writeStoredGoodsIssues(issues);

	return issues;
}

function upsertGoodsIssueRecord(record: GoodsIssueRecord) {
	const currentIssues = getInitialGoodsIssues();
	const existingIndex = currentIssues.findIndex((issue) => issue.id === record.id);

	if (existingIndex === -1) {
		return persistGoodsIssues([record, ...currentIssues]);
	}

	return persistGoodsIssues(
		currentIssues.map((issue) => (issue.id === record.id ? record : issue)),
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
