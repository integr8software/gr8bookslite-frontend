"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import type {
  PettyCashReplenishmentRecord,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { parseAmount } from "@/app/src/utils/number.util";
import {
  deletePettyCashReplenishmentApi,
  fetchPettyCashReplenishmentList,
  updatePettyCashReplenishmentStatusApi,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentApi";

const columnHelper = createColumnHelper<PettyCashReplenishmentRecord>();

export function usePettyCashReplenishmentOverviewPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => PettyCashReplenishmentDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  const amountFrom = parseAmount(amountRange.from);
  const amountTo = parseAmount(amountRange.to);

  const listQuery = useQuery({
    queryKey: [
      "cash-disbursement",
      "petty-cash-replenishment",
      "list",
      {
        query,
        statusFilter,
        startDate: dateRange.from || undefined,
        endDate: dateRange.to || undefined,
        amountFrom: amountFrom !== null ? amountFrom : undefined,
        amountTo: amountTo !== null ? amountTo : undefined,
      },
    ],
    queryFn: async () => {
      const res = await fetchPettyCashReplenishmentList({
        search: query || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        startDate: dateRange.from || undefined,
        endDate: dateRange.to || undefined,
        amountFrom: amountFrom !== null ? amountFrom : undefined,
        amountTo: amountTo !== null ? amountTo : undefined,
      });
      setLastSyncedAt(Date.now());
      return res;
    },
  });

  const records = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PettyCashReplenishmentStatus }) => {
      return await updatePettyCashReplenishmentStatusApi(id, status);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["cash-disbursement", "petty-cash-replenishment"] });
      toast.success(`Petty Cash Replenishment marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update the Petty Cash Replenishment status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deletePettyCashReplenishmentApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-disbursement", "petty-cash-replenishment"] });
      toast.success("Petty Cash Replenishment deleted successfully.");
    },
    onError: () => {
      toast.error("Could not delete Petty Cash Replenishment.");
    },
  });

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
      columnHelper.accessor("disburseAmount", {
        header: PettyCashReplenishmentColumnLabels.disburseAmount,
        size: PettyCashReplenishmentOverviewColumnWidths.disburseAmount,
        meta: { label: PettyCashReplenishmentColumnLabels.disburseAmount },
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

  const table = useReactTable({
    data: records,
    columns,
    initialState: { columnVisibility: PettyCashReplenishmentDefaultColumnVisibility },
    state: { columnVisibility, pagination, sorting },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => {
    const total = records.length;
    return [
      {
        label: "Total Entries",
        value: total,
        icon: ReceiptText,
        tone: "violet",
        summary: "All time",
        isActive: statusFilter === "All",
        onClick: () => setStatusFilter("All"),
      },
      ...PettyCashReplenishmentRecordStatuses.map((status) => {
        const count = records.filter((item) => item.status === status).length;
        const tone =
          status === PettyCashReplenishmentStatuses.posted
            ? ("emerald" as const)
            : status === PettyCashReplenishmentStatuses.forApproval
              ? ("amber" as const)
              : status === PettyCashReplenishmentStatuses.draft
                ? ("blue" as const)
                : status === PettyCashReplenishmentStatuses.disapproved
                  ? ("red" as const)
                  : ("slate" as const);

        return {
          label: status,
          value: count,
          icon: getModuleStatusMetricIcon(status),
          iconClassName: getModuleStatusMetricIconClassName(status),
          tone,
          summary: formatPartOfTotalPercentage(count, total),
          isActive: statusFilter === status,
          onClick: () => setStatusFilter(status),
        };
      }),
    ];
  }, [records, statusFilter]);

  const onUpdateStatus = (record: PettyCashReplenishmentRecord, status: PettyCashReplenishmentStatus) => {
    updateStatusMutation.mutate({ id: record.id, status });
  };

  const onDeleteRecord = (record: PettyCashReplenishmentRecord) => {
    deleteMutation.mutate(record.id);
  };

  const refreshRecords = () => {
    listQuery.refetch();
  };

  return {
    amountRange,
    dateRange,
    filteredRecords: records,
    isLoading: listQuery.isLoading,
    isUpdatingStatus: updateStatusMutation.isPending || deleteMutation.isPending,
    lastSyncedAt,
    onDeleteRecord,
    onUpdateStatus,
    updateStatus: onUpdateStatus,
    query,
    refreshRecords,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statisticCards,
    statistics: statisticCards,
    statusFilter,
    table,
  };
}
