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
  PettyCashReplenishmentColumnLabels,
  PettyCashReplenishmentDefaultColumnVisibility,
  PettyCashReplenishmentOverviewColumnWidths,
  PettyCashReplenishmentRecordStatuses,
  PettyCashReplenishmentStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import {
  getPettyCashReplenishmentRecords,
  savePettyCashReplenishmentRecords,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentService";
import type {
  PettyCashReplenishmentRecord,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";

const columnHelper = createColumnHelper<PettyCashReplenishmentRecord>();

export function usePettyCashReplenishmentOverviewPage() {
  const [records, setRecords] = useState(getPettyCashReplenishmentRecords);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => PettyCashReplenishmentDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const filteredRecords = useMemo(() => {
    const needle = normalizeLowercaseWhitespace(query);
    return records.filter((record) => {
      const searchableText = normalizeLowercaseWhitespace(
        [record.transactionNo, record.partyCode, record.partyName, record.accountCode, record.accountTitle, record.remarks].join(" "),
      );
      return (
        (!needle || searchableText.includes(needle)) &&
        (statusFilter === "All" || record.status === statusFilter) &&
        (!dateRange.from || record.documentDate >= dateRange.from) &&
        (!dateRange.to || record.documentDate <= dateRange.to) &&
        (!amountRange.from || record.amount >= Number(amountRange.from)) &&
        (!amountRange.to || record.amount <= Number(amountRange.to))
      );
    });
  }, [amountRange, dateRange, query, records, statusFilter]);
  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", {
        header: PettyCashReplenishmentColumnLabels.transactionNo,
        size: PettyCashReplenishmentOverviewColumnWidths.transactionNo,
        meta: { label: PettyCashReplenishmentColumnLabels.transactionNo },
      }),
      columnHelper.accessor("documentDate", {
        header: PettyCashReplenishmentColumnLabels.documentDate,
        size: PettyCashReplenishmentOverviewColumnWidths.documentDate,
        meta: { label: PettyCashReplenishmentColumnLabels.documentDate },
      }),
      columnHelper.accessor("partyCode", {
        header: PettyCashReplenishmentColumnLabels.partyCode,
        size: PettyCashReplenishmentOverviewColumnWidths.partyCode,
        meta: { label: PettyCashReplenishmentColumnLabels.partyCode },
      }),
      columnHelper.accessor("partyName", {
        header: PettyCashReplenishmentColumnLabels.partyName,
        size: PettyCashReplenishmentOverviewColumnWidths.partyName,
        meta: { label: PettyCashReplenishmentColumnLabels.partyName },
      }),
      columnHelper.accessor("accountCode", {
        header: PettyCashReplenishmentColumnLabels.accountCode,
        size: PettyCashReplenishmentOverviewColumnWidths.accountCode,
        meta: { label: PettyCashReplenishmentColumnLabels.accountCode },
      }),
      columnHelper.accessor("accountTitle", {
        header: PettyCashReplenishmentColumnLabels.accountTitle,
        size: PettyCashReplenishmentOverviewColumnWidths.accountTitle,
        meta: { label: PettyCashReplenishmentColumnLabels.accountTitle },
      }),
      columnHelper.accessor("amount", {
        header: PettyCashReplenishmentColumnLabels.amount,
        size: PettyCashReplenishmentOverviewColumnWidths.amount,
        meta: { label: PettyCashReplenishmentColumnLabels.amount },
      }),
      columnHelper.accessor("remarks", {
        header: PettyCashReplenishmentColumnLabels.remarks,
        size: PettyCashReplenishmentOverviewColumnWidths.remarks,
        meta: { label: PettyCashReplenishmentColumnLabels.remarks },
      }),
      columnHelper.accessor("createdBy", {
        header: PettyCashReplenishmentColumnLabels.createdBy,
        size: PettyCashReplenishmentOverviewColumnWidths.createdBy,
        meta: { label: PettyCashReplenishmentColumnLabels.createdBy },
      }),
      columnHelper.accessor("createdAt", {
        header: PettyCashReplenishmentColumnLabels.createdAt,
        size: PettyCashReplenishmentOverviewColumnWidths.createdAt,
        meta: { label: PettyCashReplenishmentColumnLabels.createdAt },
      }),
      columnHelper.accessor("updatedBy", {
        header: PettyCashReplenishmentColumnLabels.updatedBy,
        size: PettyCashReplenishmentOverviewColumnWidths.updatedBy,
        meta: { label: PettyCashReplenishmentColumnLabels.updatedBy },
      }),
      columnHelper.accessor("updatedAt", {
        header: PettyCashReplenishmentColumnLabels.updatedAt,
        size: PettyCashReplenishmentOverviewColumnWidths.updatedAt,
        meta: { label: PettyCashReplenishmentColumnLabels.updatedAt },
      }),
      columnHelper.accessor("status", {
        header: PettyCashReplenishmentColumnLabels.status,
        size: PettyCashReplenishmentOverviewColumnWidths.status,
        meta: { className: "text-center", label: PettyCashReplenishmentColumnLabels.status },
      }),
      columnHelper.display({
        id: "actions",
        header: PettyCashReplenishmentColumnLabels.actions,
        size: PettyCashReplenishmentOverviewColumnWidths.actions,
        meta: { className: "text-center", label: PettyCashReplenishmentColumnLabels.actions },
      }),
    ],
    [],
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns its state handlers.
  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { columnVisibility: PettyCashReplenishmentDefaultColumnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnVisibility, pagination, sorting },
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
      ...PettyCashReplenishmentRecordStatuses.map((status) => {
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

  function updateStatus(record: PettyCashReplenishmentRecord, status: PettyCashReplenishmentStatus) {
    const next = records.map((item) =>
      item.id === record.id ? { ...item, status, updatedAt: new Date().toISOString(), updatedBy: "Current User" } : item,
    );
    setRecords(next);
    savePettyCashReplenishmentRecords(next);
    setLastSyncedAt(Date.now());
    toast.success(`Petty Cash Replenishment Marked as ${status}.`);
  }

  function refreshRecords() {
    setRecords(getPettyCashReplenishmentRecords());
    setLastSyncedAt(Date.now());
  }

  return {
    amountRange,
    dateRange,
    isLoading: false,
    lastSyncedAt,
    query,
    refreshRecords,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statisticCards,
    statusFilter,
    table,
    updateStatus,
  };
}

function getMetricTone(status: PettyCashReplenishmentStatus) {
  if (status === PettyCashReplenishmentStatuses.posted) return "emerald" as const;
  if (status === PettyCashReplenishmentStatuses.forApproval) return "amber" as const;
  if (status === PettyCashReplenishmentStatuses.disapproved) return "red" as const;
  if (status === PettyCashReplenishmentStatuses.cancelled) return "slate" as const;
  return "blue" as const;
}
