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
  AdvancesToSuppliersColumnLabels,
  AdvancesToSuppliersDefaultColumnVisibility,
  AdvancesToSuppliersOverviewColumnWidths,
  AdvancesToSuppliersRecordStatuses,
  AdvancesToSuppliersStatuses,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import {
  getAdvancesToSuppliersRecords,
  saveAdvancesToSuppliersRecords,
} from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersService";
import type {
  AdvancesToSuppliersRecord,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";

const columnHelper = createColumnHelper<AdvancesToSuppliersRecord>();

export function useAdvancesToSuppliersOverviewPage() {
  const [records, setRecords] = useState(getAdvancesToSuppliersRecords);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => AdvancesToSuppliersDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const filteredRecords = useMemo(() => {
    const needle = normalizeLowercaseWhitespace(query);
    return records.filter((record) => {
      const searchableText = normalizeLowercaseWhitespace(
        [
          record.transactionNo,
          record.partyCode,
          record.partyName,
          record.accountCode,
          record.accountTitle,
          record.poReference,
          record.remarks,
        ].join(" "),
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
        header: AdvancesToSuppliersColumnLabels.transactionNo,
        size: AdvancesToSuppliersOverviewColumnWidths.transactionNo,
        meta: { label: AdvancesToSuppliersColumnLabels.transactionNo },
      }),
      columnHelper.accessor("documentDate", {
        header: AdvancesToSuppliersColumnLabels.documentDate,
        size: AdvancesToSuppliersOverviewColumnWidths.documentDate,
        meta: { label: AdvancesToSuppliersColumnLabels.documentDate },
      }),
      columnHelper.accessor("partyCode", {
        header: AdvancesToSuppliersColumnLabels.partyCode,
        size: AdvancesToSuppliersOverviewColumnWidths.partyCode,
        meta: { label: AdvancesToSuppliersColumnLabels.partyCode },
      }),
      columnHelper.accessor("partyName", {
        header: AdvancesToSuppliersColumnLabels.partyName,
        size: AdvancesToSuppliersOverviewColumnWidths.partyName,
        meta: { label: AdvancesToSuppliersColumnLabels.partyName },
      }),
      columnHelper.accessor("accountCode", {
        header: AdvancesToSuppliersColumnLabels.accountCode,
        size: AdvancesToSuppliersOverviewColumnWidths.accountCode,
        meta: { label: AdvancesToSuppliersColumnLabels.accountCode },
      }),
      columnHelper.accessor("accountTitle", {
        header: AdvancesToSuppliersColumnLabels.accountTitle,
        size: AdvancesToSuppliersOverviewColumnWidths.accountTitle,
        meta: { label: AdvancesToSuppliersColumnLabels.accountTitle },
      }),
      columnHelper.accessor("amount", {
        header: AdvancesToSuppliersColumnLabels.amount,
        size: AdvancesToSuppliersOverviewColumnWidths.amount,
        meta: { label: AdvancesToSuppliersColumnLabels.amount },
      }),
      columnHelper.accessor("remarks", {
        header: AdvancesToSuppliersColumnLabels.remarks,
        size: AdvancesToSuppliersOverviewColumnWidths.remarks,
        meta: { label: AdvancesToSuppliersColumnLabels.remarks },
      }),
      columnHelper.accessor("createdBy", {
        header: AdvancesToSuppliersColumnLabels.createdBy,
        size: AdvancesToSuppliersOverviewColumnWidths.createdBy,
        meta: { label: AdvancesToSuppliersColumnLabels.createdBy },
      }),
      columnHelper.accessor("createdAt", {
        header: AdvancesToSuppliersColumnLabels.createdAt,
        size: AdvancesToSuppliersOverviewColumnWidths.createdAt,
        meta: { label: AdvancesToSuppliersColumnLabels.createdAt },
      }),
      columnHelper.accessor("updatedBy", {
        header: AdvancesToSuppliersColumnLabels.updatedBy,
        size: AdvancesToSuppliersOverviewColumnWidths.updatedBy,
        meta: { label: AdvancesToSuppliersColumnLabels.updatedBy },
      }),
      columnHelper.accessor("updatedAt", {
        header: AdvancesToSuppliersColumnLabels.updatedAt,
        size: AdvancesToSuppliersOverviewColumnWidths.updatedAt,
        meta: { label: AdvancesToSuppliersColumnLabels.updatedAt },
      }),
      columnHelper.accessor("status", {
        header: AdvancesToSuppliersColumnLabels.status,
        size: AdvancesToSuppliersOverviewColumnWidths.status,
        meta: { className: "text-center", label: AdvancesToSuppliersColumnLabels.status },
      }),
      columnHelper.display({
        id: "actions",
        header: AdvancesToSuppliersColumnLabels.actions,
        size: AdvancesToSuppliersOverviewColumnWidths.actions,
        meta: { className: "text-center", label: AdvancesToSuppliersColumnLabels.actions },
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
    initialState: { columnVisibility: AdvancesToSuppliersDefaultColumnVisibility },
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
      ...AdvancesToSuppliersRecordStatuses.map((status) => {
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

  function updateStatus(record: AdvancesToSuppliersRecord, status: AdvancesToSuppliersStatus) {
    const next = records.map((item) =>
      item.id === record.id ? { ...item, status, updatedAt: new Date().toISOString(), updatedBy: "Current User" } : item,
    );
    setRecords(next);
    saveAdvancesToSuppliersRecords(next);
    setLastSyncedAt(Date.now());
    toast.success(`Advances to Suppliers Marked as ${status}.`);
  }

  function refreshRecords() {
    setRecords(getAdvancesToSuppliersRecords());
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

function getMetricTone(status: AdvancesToSuppliersStatus) {
  if (status === AdvancesToSuppliersStatuses.posted) return "emerald" as const;
  if (status === AdvancesToSuppliersStatuses.forApproval) return "amber" as const;
  if (status === AdvancesToSuppliersStatuses.disapproved) return "red" as const;
  if (status === AdvancesToSuppliersStatuses.cancelled) return "slate" as const;
  return "blue" as const;
}

