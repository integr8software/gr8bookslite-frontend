"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ReceiptText } from "lucide-react";
import toast from "react-hot-toast";
import {
  RequestForPaymentColumnLabels,
  RequestForPaymentDefaultColumnVisibility,
  RequestForPaymentRecordStatuses,
  RequestForPaymentStatuses,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import {
  deleteRequestForPaymentRecord,
  getRequestForPaymentRecords,
  updateRequestForPaymentStatus,
} from "@/app/src/services/modules/cash-disbursement/request-for-payment/RequestForPaymentService";
import type {
  RequestForPaymentRecord,
  RequestForPaymentStatus,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

const columnHelper = createColumnHelper<RequestForPaymentRecord>();

export function useRequestForPaymentOverviewPage() {
  const [records, setRecords] = useState(getRequestForPaymentRecords);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => RequestForPaymentDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const needle = query.trim().toLowerCase();
        return (
          (!needle ||
            [
              record.transactionNo,
              record.partyCode,
              record.partyName,
              record.paymentMethod,
              record.responsibilityCenterName,
              record.remarks,
            ]
              .join(" ")
              .toLowerCase()
              .includes(needle)) &&
          (statusFilter === "All" || record.status === statusFilter) &&
          (!dateRange.from || record.documentDate >= dateRange.from) &&
          (!dateRange.to || record.documentDate <= dateRange.to) &&
          (!amountRange.from || record.amount >= Number(amountRange.from)) &&
          (!amountRange.to || record.amount <= Number(amountRange.to))
        );
      }),
    [amountRange, dateRange, query, records, statusFilter],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", {
        header: RequestForPaymentColumnLabels.transactionNo,
        size: TransactionOverviewColumnWidths.transactionNumber,
        meta: { label: RequestForPaymentColumnLabels.transactionNo },
      }),
      columnHelper.accessor("documentDate", {
        header: RequestForPaymentColumnLabels.documentDate,
        size: TransactionOverviewColumnWidths.documentDate,
        meta: { label: RequestForPaymentColumnLabels.documentDate },
      }),
      columnHelper.accessor("dateNeeded", {
        header: RequestForPaymentColumnLabels.dateNeeded,
        size: TransactionOverviewColumnWidths.documentDate,
        meta: { label: RequestForPaymentColumnLabels.dateNeeded },
      }),
      columnHelper.accessor("partyCode", {
        header: RequestForPaymentColumnLabels.partyCode,
        size: TransactionOverviewColumnWidths.partyCode,
        meta: { label: RequestForPaymentColumnLabels.partyCode },
      }),
      columnHelper.accessor("partyName", {
        header: RequestForPaymentColumnLabels.partyName,
        size: TransactionOverviewColumnWidths.partyName,
        meta: { label: RequestForPaymentColumnLabels.partyName },
      }),
      columnHelper.accessor("paymentMethod", {
        header: RequestForPaymentColumnLabels.paymentMethod,
        size: 150,
        meta: { label: RequestForPaymentColumnLabels.paymentMethod },
      }),
      columnHelper.accessor("responsibilityCenterName", {
        header: RequestForPaymentColumnLabels.responsibilityCenterName,
        size: 200,
        meta: { label: RequestForPaymentColumnLabels.responsibilityCenterName },
      }),
      columnHelper.accessor("amount", {
        header: RequestForPaymentColumnLabels.amount,
        size: TransactionOverviewColumnWidths.amount,
        meta: { label: RequestForPaymentColumnLabels.amount },
      }),
      columnHelper.accessor("remarks", {
        header: RequestForPaymentColumnLabels.remarks,
        size: TransactionOverviewColumnWidths.remarks,
        meta: { label: RequestForPaymentColumnLabels.remarks },
      }),
      columnHelper.accessor("createdBy", {
        header: RequestForPaymentColumnLabels.createdBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: RequestForPaymentColumnLabels.createdBy },
      }),
      columnHelper.accessor("createdAt", {
        header: RequestForPaymentColumnLabels.createdAt,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: RequestForPaymentColumnLabels.createdAt },
      }),
      columnHelper.accessor("updatedBy", {
        header: RequestForPaymentColumnLabels.updatedBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: RequestForPaymentColumnLabels.updatedBy },
      }),
      columnHelper.accessor("updatedAt", {
        header: RequestForPaymentColumnLabels.updatedAt,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: RequestForPaymentColumnLabels.updatedAt },
      }),
      columnHelper.accessor("status", {
        header: RequestForPaymentColumnLabels.status,
        size: TransactionOverviewColumnWidths.status,
        meta: { label: RequestForPaymentColumnLabels.status },
      }),
      columnHelper.display({
        id: "actions",
        header: RequestForPaymentColumnLabels.actions,
        size: TransactionOverviewColumnWidths.actions,
        meta: { label: RequestForPaymentColumnLabels.actions },
      }),
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns its state handlers.
  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: {
      columnVisibility,
      pagination,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
  });

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(
    () => [
      {
        icon: ReceiptText,
        label: "Total Entries",
        value: records.length,
        summary: "All time",
        tone: "violet",
        onClick: () => setStatusFilter("All"),
        isActive: statusFilter === "All",
      },
      ...RequestForPaymentRecordStatuses.map((status) => {
        const count = records.filter((record) => record.status === status).length;
        return {
          icon: getModuleStatusMetricIcon(status),
          iconClassName: getModuleStatusMetricIconClassName(status),
          label: status,
          value: count,
          summary: formatPartOfTotalPercentage(count, records.length),
          tone: getMetricTone(status),
          onClick: () => setStatusFilter(status),
          isActive: statusFilter === status,
        };
      }),
    ],
    [records, statusFilter],
  );

  function refreshRecords() {
    setRecords(getRequestForPaymentRecords());
    setLastSyncedAt(Date.now());
  }

  function handleUpdateStatus(record: RequestForPaymentRecord, nextStatus: RequestForPaymentStatus) {
    const updated = updateRequestForPaymentStatus(record.id, nextStatus);
    setRecords(updated);
    toast.success(`Request ${record.transactionNo} marked as ${nextStatus}.`);
  }

  function handleDeleteRecord(record: RequestForPaymentRecord) {
    const updated = deleteRequestForPaymentRecord(record.id);
    setRecords(updated);
    toast.success(`Request ${record.transactionNo} deleted.`);
  }

  return {
    amountRange,
    columnVisibility,
    dateRange,
    filteredCount: filteredRecords.length,
    handleDeleteRecord,
    handleUpdateStatus,
    lastSyncedAt,
    pagination,
    query,
    records,
    refreshRecords,
    setAmountRange,
    setColumnVisibility,
    setDateRange,
    setPagination,
    setQuery,
    setSorting,
    setStatusFilter,
    sorting,
    statisticCards,
    statusFilter,
    statusOptions: RequestForPaymentRecordStatuses,
    table,
    totalCount: records.length,
  };
}

function getMetricTone(status: RequestForPaymentStatus) {
  if (status === RequestForPaymentStatuses.approved) return "emerald" as const;
  if (status === RequestForPaymentStatuses.forApproval) return "amber" as const;
  if (status === RequestForPaymentStatuses.disapproved) return "red" as const;
  if (status === RequestForPaymentStatuses.cancelled) return "slate" as const;
  if (status === RequestForPaymentStatuses.closed) return "violet" as const;
  return "blue" as const;
}

