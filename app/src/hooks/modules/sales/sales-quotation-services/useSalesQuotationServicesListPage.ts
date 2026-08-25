"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type PaginationState, type SortingState } from "@tanstack/react-table";
import { SalesQuotationServicesStatusFilterOptions } from "@/app/src/constants/modules/sales/sales-quotation-services/SalesQuotationServicesConstants";
import { getInitialSalesQuotationServices } from "@/app/src/data/modules/sales/sales-quotation-services/SalesQuotationServicesData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { SalesQuotationServicesRecord } from "@/app/src/types/modules/sales/sales-quotation-services/SalesQuotationServicesTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useSalesQuotationServicesListPage() {
	const [records, setRecords] = useState<SalesQuotationServicesRecord[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
	const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
	const [query, setQueryState] = useState("");
	const [dateRange, setDateRangeState] = useState<DateRangeValue>({ from: "", to: "" });
	const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({ from: "", to: "" });
	const [statusFilter, setStatusFilterState] = useState<(typeof SalesQuotationServicesStatusFilterOptions)[number]["value"]>("all");
	const deferredQuery = useDeferredValue(query);

	useEffect(() => {
		// Browser storage is intentionally read after hydration.
		setRecords(getInitialSalesQuotationServices());
	}, []);

	const filteredRecords = useMemo(() => records.filter((record) => {
		const values = record.formValues;
		const matchesQuery = [values.transNo, values.partyCode, values.partyName, values.projectCode, values.projectName, values.status].join(" ").toLowerCase().includes(deferredQuery.trim().toLowerCase());
		const fromAmount = amountRange.from.trim() ? parseMoneyNumberInput(amountRange.from) : 0;
		const toAmount = amountRange.to.trim() ? parseMoneyNumberInput(amountRange.to) : Number.MAX_SAFE_INTEGER;
		const recordDate = new Date(values.prDate).setHours(0, 0, 0, 0);
		const fromDate = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : null;
		const toDate = dateRange.to ? new Date(dateRange.to).setHours(0, 0, 0, 0) : null;
		return matchesQuery && (statusFilter === "all" || values.status === statusFilter) && record.amount >= fromAmount && record.amount <= toAmount && !(fromDate !== null && recordDate < fromDate) && !(toDate !== null && recordDate > toDate);
	}), [amountRange, dateRange, deferredQuery, records, statusFilter]);

	const columns = useMemo<ColumnDef<SalesQuotationServicesRecord>[]>(() => [
		{ id: "transNo", accessorFn: (record) => record.formValues.transNo, header: "SQ No.", meta: { className: "w-[11rem]" } },
		{ id: "date", accessorFn: (record) => record.formValues.prDate, header: "Date", sortingFn: "datetime", meta: { className: "w-[10rem]" } },
		{ id: "party", accessorFn: (record) => record.formValues.partyName, header: "Party", meta: { className: "w-[16rem]" } },
		{ id: "project", accessorFn: (record) => record.formValues.projectName, header: "Project", meta: { className: "w-[14rem]" } },
		{ id: "amount", accessorKey: "amount", header: "Gross Amount", meta: { className: "w-[12rem] text-right" } },
		{ id: "status", accessorFn: (record) => record.formValues.status, header: "Status", meta: { className: "w-[9rem]" } },
		{ id: "actions", header: "Actions", enableSorting: false, meta: { className: "w-[10rem] text-center" } },
	], []);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
	const table = useReactTable({ data: filteredRecords, columns, state: { pagination, sorting }, onPaginationChange: setPagination, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel() });
	const resetFilters = () => { setQueryState(""); setDateRangeState({ from: "", to: "" }); setAmountRangeState({ from: "", to: "" }); setStatusFilterState("all"); table.setPageIndex(0); };

	return {
		amountRange, dateRange, query, records, resetFilters, statusFilter, table,
		setAmountRange: (value: AmountRangeValue) => { setAmountRangeState(value); table.setPageIndex(0); },
		setDateRange: (value: DateRangeValue) => { setDateRangeState(value); table.setPageIndex(0); },
		setQuery: (value: string) => { setQueryState(value); table.setPageIndex(0); },
		setStatusFilter: (value: typeof statusFilter) => { setStatusFilterState(value); table.setPageIndex(0); },
	};
}
