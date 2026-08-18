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
  RevolvingFundReplenishmentColumnLabels,
  RevolvingFundReplenishmentDefaultColumnVisibility,
  RevolvingFundReplenishmentOverviewColumnWidths,
  RevolvingFundReplenishmentRecordStatuses,
  RevolvingFundReplenishmentStatuses,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import {
  getRevolvingFundReplenishmentRecords,
  saveRevolvingFundReplenishmentRecords,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentService";
import type {
  RevolvingFundReplenishmentRecord,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";

const columnHelper = createColumnHelper<RevolvingFundReplenishmentRecord>();
const emptyDateRange: DateRangeValue = { from: "", to: "" };
const emptyAmountRange: AmountRangeValue = { from: "", to: "" };

export function useRevolvingFundReplenishmentOverviewPage() {
  const [records, setRecords] = useState(getRevolvingFundReplenishmentRecords);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>(emptyDateRange);
  const [amountRange, setAmountRange] = useState<AmountRangeValue>(emptyAmountRange);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => RevolvingFundReplenishmentDefaultColumnVisibility);
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
        header: RevolvingFundReplenishmentColumnLabels.transactionNo,
        size: RevolvingFundReplenishmentOverviewColumnWidths.transactionNo,
        meta: { label: RevolvingFundReplenishmentColumnLabels.transactionNo },
      }),
      columnHelper.accessor("documentDate", {
        header: RevolvingFundReplenishmentColumnLabels.documentDate,
        size: RevolvingFundReplenishmentOverviewColumnWidths.documentDate,
        meta: { label: RevolvingFundReplenishmentColumnLabels.documentDate },
      }),
      columnHelper.accessor("partyCode", {
        header: RevolvingFundReplenishmentColumnLabels.partyCode,
        size: RevolvingFundReplenishmentOverviewColumnWidths.partyCode,
        meta: { label: RevolvingFundReplenishmentColumnLabels.partyCode },
      }),
      columnHelper.accessor("partyName", {
        header: RevolvingFundReplenishmentColumnLabels.partyName,
        size: RevolvingFundReplenishmentOverviewColumnWidths.partyName,
        meta: { label: RevolvingFundReplenishmentColumnLabels.partyName },
      }),
      columnHelper.accessor("accountCode", {
        header: RevolvingFundReplenishmentColumnLabels.accountCode,
        size: RevolvingFundReplenishmentOverviewColumnWidths.accountCode,
        meta: { label: RevolvingFundReplenishmentColumnLabels.accountCode },
      }),
      columnHelper.accessor("accountTitle", {
        header: RevolvingFundReplenishmentColumnLabels.accountTitle,
        size: RevolvingFundReplenishmentOverviewColumnWidths.accountTitle,
        meta: { label: RevolvingFundReplenishmentColumnLabels.accountTitle },
      }),
      columnHelper.accessor("amount", {
        header: RevolvingFundReplenishmentColumnLabels.amount,
        size: RevolvingFundReplenishmentOverviewColumnWidths.amount,
        meta: { label: RevolvingFundReplenishmentColumnLabels.amount },
      }),
      columnHelper.accessor("remarks", {
        header: RevolvingFundReplenishmentColumnLabels.remarks,
        size: RevolvingFundReplenishmentOverviewColumnWidths.remarks,
        meta: { label: RevolvingFundReplenishmentColumnLabels.remarks },
      }),
      columnHelper.accessor("createdBy", {
        header: RevolvingFundReplenishmentColumnLabels.createdBy,
        size: RevolvingFundReplenishmentOverviewColumnWidths.createdBy,
        meta: { label: RevolvingFundReplenishmentColumnLabels.createdBy },
      }),
      columnHelper.accessor("createdAt", {
        header: RevolvingFundReplenishmentColumnLabels.createdAt,
        size: RevolvingFundReplenishmentOverviewColumnWidths.createdAt,
        meta: { label: RevolvingFundReplenishmentColumnLabels.createdAt },
      }),
      columnHelper.accessor("updatedBy", {
        header: RevolvingFundReplenishmentColumnLabels.updatedBy,
        size: RevolvingFundReplenishmentOverviewColumnWidths.updatedBy,
        meta: { label: RevolvingFundReplenishmentColumnLabels.updatedBy },
      }),
      columnHelper.accessor("updatedAt", {
        header: RevolvingFundReplenishmentColumnLabels.updatedAt,
        size: RevolvingFundReplenishmentOverviewColumnWidths.updatedAt,
        meta: { label: RevolvingFundReplenishmentColumnLabels.updatedAt },
      }),
      columnHelper.accessor("status", {
        header: RevolvingFundReplenishmentColumnLabels.status,
        size: RevolvingFundReplenishmentOverviewColumnWidths.status,
        meta: { className: "text-center", label: RevolvingFundReplenishmentColumnLabels.status },
      }),
      columnHelper.display({
        id: "actions",
        header: RevolvingFundReplenishmentColumnLabels.actions,
        size: RevolvingFundReplenishmentOverviewColumnWidths.actions,
        meta: { className: "text-center", label: RevolvingFundReplenishmentColumnLabels.actions },
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
    initialState: { columnVisibility: RevolvingFundReplenishmentDefaultColumnVisibility },
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
      ...RevolvingFundReplenishmentRecordStatuses.map((status) => {
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

  function updateStatus(record: RevolvingFundReplenishmentRecord, status: RevolvingFundReplenishmentStatus) {
    const next = records.map((item) =>
      item.id === record.id ? { ...item, status, updatedAt: new Date().toISOString(), updatedBy: "Current User" } : item,
    );
    setRecords(next);
    saveRevolvingFundReplenishmentRecords(next);
    setLastSyncedAt(Date.now());
    toast.success(`Revolving fund replenishment marked as ${status}.`);
  }

  function refreshRecords() {
    setRecords(getRevolvingFundReplenishmentRecords());
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

function getMetricTone(status: RevolvingFundReplenishmentStatus) {
  if (status === RevolvingFundReplenishmentStatuses.posted) return "emerald" as const;
  if (status === RevolvingFundReplenishmentStatuses.forApproval) return "amber" as const;
  if (status === RevolvingFundReplenishmentStatuses.disapproved) return "red" as const;
  if (status === RevolvingFundReplenishmentStatuses.cancelled) return "slate" as const;
  return "blue" as const;
}

export type { RevolvingFundReplenishmentOverviewPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
