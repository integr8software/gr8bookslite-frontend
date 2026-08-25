"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { SalesOrderStatusFilterOptions } from "@/app/src/constants/modules/sales/sales-order/SalesOrderConstants";
import { loadSalesOrders } from "@/app/src/data/modules/sales/sales-order/SalesOrderData";
import { getSalesQuotationTotal } from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { SalesOrderRecord } from "@/app/src/types/modules/sales/sales-order/SalesOrderTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useSalesOrderOverviewPage() {
  const [orders] = useState(loadSalesOrders);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "prDate", desc: true }]);
  const [query, setQueryState] = useState("");
  const [dateRange, setDateRangeState] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({ from: "", to: "" });
  const [statusFilter, setStatusFilterState] = useState<(typeof SalesOrderStatusFilterOptions)[number]["value"]>("all");
  const deferredQuery = useDeferredValue(query);
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesQuery = [order.transNo, order.referenceNo, order.partyName, order.status]
          .join(" ")
          .toLowerCase()
          .includes(deferredQuery.toLowerCase());
        const amount = getSalesQuotationTotal(order);
        const fromAmount = amountRange.from.trim() ? parseMoneyNumberInput(amountRange.from) : 0;
        const toAmount = amountRange.to.trim() ? parseMoneyNumberInput(amountRange.to) : Number.MAX_SAFE_INTEGER;
        const orderDate = new Date(order.prDate).setHours(0, 0, 0, 0);
        const fromDate = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : null;
        const toDate = dateRange.to ? new Date(dateRange.to).setHours(0, 0, 0, 0) : null;
        return (
          matchesQuery &&
          (statusFilter === "all" || order.status === statusFilter) &&
          amount >= fromAmount &&
          amount <= toAmount &&
          !(fromDate !== null && orderDate < fromDate) &&
          !(toDate !== null && orderDate > toDate)
        );
      }),
    [amountRange, dateRange, deferredQuery, orders, statusFilter],
  );
  const columns = useMemo<ColumnDef<SalesOrderRecord>[]>(
    () => [
      { id: "transNo", accessorKey: "transNo", header: "SO No.", meta: { className: "w-[12rem]" } },
      { id: "prDate", accessorKey: "prDate", header: "Order Date", sortingFn: "datetime", meta: { className: "w-[11rem]" } },
      { id: "partyName", accessorKey: "partyName", header: "Customer", meta: { className: "w-[18rem]" } },
      { id: "referenceNo", accessorKey: "referenceNo", header: "Reference No.", meta: { className: "w-[12rem]" } },
      { id: "amount", accessorFn: getSalesQuotationTotal, header: "Amount", meta: { className: "w-[11rem]" } },
      { id: "status", accessorKey: "status", header: "Status", meta: { className: "w-[10rem]" } },
      { id: "actions", header: "Actions", enableSorting: false, meta: { className: "w-[10rem] text-center" } },
    ],
    [],
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
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
    orders,
    query,
    resetFilters,
    setAmountRange: (value: AmountRangeValue) => {
      setAmountRangeState(value);
      table.setPageIndex(0);
    },
    setDateRange: (value: DateRangeValue) => {
      setDateRangeState(value);
      table.setPageIndex(0);
    },
    setQuery: (value: string) => {
      setQueryState(value);
      table.setPageIndex(0);
    },
    setStatusFilter: (value: typeof statusFilter) => {
      setStatusFilterState(value);
      table.setPageIndex(0);
    },
    statusFilter,
    table,
  };
}
