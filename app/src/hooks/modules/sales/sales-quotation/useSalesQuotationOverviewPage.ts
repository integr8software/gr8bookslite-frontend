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
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import { useSalesQuotationStore } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotation";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { recordSalesQuotationAuditLog } from "@/app/src/services/modules/sales/sales-quotation/SalesQuotationAuditLog";
import { SalesQuotationStatusFilterOptions } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { getSalesQuotationTotal } from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function useSalesQuotationOverviewPage() {
  const { deleteRequest, isMutating, lastSyncedAt, requests } = useSalesQuotationStore();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeBranchName = useAppStore((state) => state.activeBranchName);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [statusFilter, setStatusFilter] = useState<(typeof SalesQuotationStatusFilterOptions)[number]["value"]>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "prDate", desc: true }]);
  const [pendingDeleteRequest, setPendingDeleteRequest] = useState<SalesQuotationRecord | null>(null);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const fromAmount = amountRange.from.trim() ? parseMoneyNumberInput(amountRange.from) : 0;
    const toAmount = amountRange.to.trim() ? parseMoneyNumberInput(amountRange.to) : Number.MAX_SAFE_INTEGER;
    const fromDate = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : null;
    const toDate = dateRange.to ? new Date(dateRange.to).setHours(0, 0, 0, 0) : null;

    return requests.filter((request) => {
      const matchesQuery = [request.transNo, request.partyCode, request.partyName, request.status, request.projectCode, request.projectName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const amount = getSalesQuotationTotal(request);
      const requestDate = new Date(request.prDate).setHours(0, 0, 0, 0);
      return (
        matchesQuery &&
        (statusFilter === "all" || request.status === statusFilter) &&
        amount >= fromAmount &&
        amount <= toAmount &&
        !(fromDate !== null && requestDate < fromDate) &&
        !(toDate !== null && requestDate > toDate)
      );
    });
  }, [amountRange, dateRange, deferredQuery, requests, statusFilter]);
  const columns = useMemo<ColumnDef<SalesQuotationRecord>[]>(
    () => [
      createColumn("transNo", "PR No.", "w-[9rem]"),
      createColumn("partyName", "Party", "w-[18rem]"),
      createColumn("prDate", "Date", "w-[10rem]"),
      createColumn("status", "Status", "w-[9rem]"),
      {
        id: "grossAmount",
        header: "Gross Amount",
        accessorFn: (request) => request.items.reduce((total, item) => total + item.quantity * item.itemPrice, 0),
        sortingFn: "basic",
        meta: { className: "w-[12rem] text-right" },
      },
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
    data: filteredRequests,
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

  function handleQueryChange(value: string) {
    setQuery(value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setQuery("");
    setDateRange({ from: "", to: "" });
    setAmountRange({ from: "", to: "" });
    setStatusFilter("all");
    table.setPageIndex(0);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteRequest) {
      return;
    }

    deleteRequest(pendingDeleteRequest.id);
    recordSalesQuotationAuditLog("DELETE", pendingDeleteRequest, {
      branchId: activeBranchId,
      branchName: activeBranchName,
    });
    setPendingDeleteRequest(null);
  }

  return {
    amountRange,
    dateRange,
    filteredRequests,
    handleConfirmDelete,
    handleQueryChange,
    isMutating,
    lastSyncedAt,
    pendingDeleteRequest,
    query,
    requests,
    resetFilters,
    setAmountRange: (value: AmountRangeValue) => {
      setAmountRange(value);
      table.setPageIndex(0);
    },
    setDateRange: (value: DateRangeValue) => {
      setDateRange(value);
      table.setPageIndex(0);
    },
    setPendingDeleteRequest,
    setStatusFilter: (value: typeof statusFilter) => {
      setStatusFilter(value);
      table.setPageIndex(0);
    },
    statusFilter,
    table,
  };
}

function createColumn(key: keyof SalesQuotationRecord, header: string, className: string): ColumnDef<SalesQuotationRecord> {
  return {
    accessorKey: key,
    header,
    sortingFn: key === "prDate" ? "datetime" : "alphanumeric",
    meta: { className },
  };
}
