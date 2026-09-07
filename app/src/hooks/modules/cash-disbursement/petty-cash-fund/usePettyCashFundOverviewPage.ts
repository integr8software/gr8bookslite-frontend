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
  PettyCashFundAllStatusFilter,
  PettyCashFundColumnLabels,
  PettyCashFundDefaultColumnVisibility,
  PettyCashFundRecordStatuses,
  PettyCashFundStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { PettyCashFundQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundQueryKeys";
import type {
  PettyCashFundRecord,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { parseAmount } from "@/app/src/utils/number.util";
import {
  deletePettyCashFundApi,
  fetchPettyCashFundList,
  updatePettyCashFundStatusApi,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundApi";

const columnHelper = createColumnHelper<PettyCashFundRecord>();

export function usePettyCashFundOverviewPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(PettyCashFundAllStatusFilter);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => PettyCashFundDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  const amountFrom = parseAmount(amountRange.from);
  const amountTo = parseAmount(amountRange.to);

  const fundQuery = useQuery({
    queryKey: PettyCashFundQueryKeys.list({
      query,
      statusFilter,
      startDate: dateRange.from || undefined,
      endDate: dateRange.to || undefined,
      amountFrom: amountFrom !== null ? amountFrom : undefined,
      amountTo: amountTo !== null ? amountTo : undefined,
    }),
    queryFn: async () => {
      const res = await fetchPettyCashFundList({
        search: query || undefined,
        status: statusFilter !== PettyCashFundAllStatusFilter ? statusFilter : undefined,
        startDate: dateRange.from || undefined,
        endDate: dateRange.to || undefined,
        amountFrom: amountFrom !== null ? amountFrom : undefined,
        amountTo: amountTo !== null ? amountTo : undefined,
      });
      setLastSyncedAt(Date.now());
      return res;
    },
  });

  const records = useMemo(() => fundQuery.data?.data ?? [], [fundQuery.data?.data]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PettyCashFundStatus }) => {
      return await updatePettyCashFundStatusApi(id, status);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: PettyCashFundQueryKeys.all });
      toast.success(`Petty Cash Fund marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update the Petty Cash Fund status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deletePettyCashFundApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PettyCashFundQueryKeys.all });
      toast.success("Petty Cash Fund deleted successfully.");
    },
    onError: () => {
      toast.error("Could not delete Petty Cash Fund.");
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", {
        header: PettyCashFundColumnLabels.transactionNo,
        size: TransactionOverviewColumnWidths.transactionNumber,
        meta: { label: PettyCashFundColumnLabels.transactionNo },
      }),
      columnHelper.accessor("documentDate", {
        header: PettyCashFundColumnLabels.documentDate,
        size: TransactionOverviewColumnWidths.documentDate,
        meta: { label: PettyCashFundColumnLabels.documentDate },
      }),
      columnHelper.accessor("partyCode", {
        header: PettyCashFundColumnLabels.partyCode,
        size: TransactionOverviewColumnWidths.partyCode,
        meta: { label: PettyCashFundColumnLabels.partyCode },
      }),
      columnHelper.accessor("partyName", {
        header: PettyCashFundColumnLabels.partyName,
        size: TransactionOverviewColumnWidths.partyName,
        meta: { label: PettyCashFundColumnLabels.partyName },
      }),
      columnHelper.accessor("accountCode", {
        header: PettyCashFundColumnLabels.accountCode,
        size: TransactionOverviewColumnWidths.accountCode,
        meta: { label: PettyCashFundColumnLabels.accountCode },
      }),
      columnHelper.accessor("accountTitle", {
        header: PettyCashFundColumnLabels.accountTitle,
        size: TransactionOverviewColumnWidths.accountTitle,
        meta: { label: PettyCashFundColumnLabels.accountTitle },
      }),
      columnHelper.accessor("amount", {
        header: PettyCashFundColumnLabels.amount,
        size: TransactionOverviewColumnWidths.amount,
        meta: { label: PettyCashFundColumnLabels.amount },
      }),
      columnHelper.accessor("disburseAmount", {
        header: PettyCashFundColumnLabels.disburseAmount,
        size: TransactionOverviewColumnWidths.amount,
        meta: { label: PettyCashFundColumnLabels.disburseAmount },
      }),
      columnHelper.accessor("remarks", {
        header: PettyCashFundColumnLabels.remarks,
        size: TransactionOverviewColumnWidths.remarks,
        meta: { label: PettyCashFundColumnLabels.remarks },
      }),
      columnHelper.accessor("createdBy", {
        header: PettyCashFundColumnLabels.createdBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: PettyCashFundColumnLabels.createdBy },
      }),
      columnHelper.accessor("createdAt", {
        header: PettyCashFundColumnLabels.createdAt,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: PettyCashFundColumnLabels.createdAt },
      }),
      columnHelper.accessor("updatedBy", {
        header: PettyCashFundColumnLabels.updatedBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: PettyCashFundColumnLabels.updatedBy },
      }),
      columnHelper.accessor("updatedAt", {
        header: PettyCashFundColumnLabels.updatedAt,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: PettyCashFundColumnLabels.updatedAt },
      }),
      columnHelper.accessor("status", {
        header: PettyCashFundColumnLabels.status,
        size: TransactionOverviewColumnWidths.status,
        meta: { className: "text-center", label: PettyCashFundColumnLabels.status },
      }),
      columnHelper.display({
        id: "actions",
        header: PettyCashFundColumnLabels.actions,
        size: TransactionOverviewColumnWidths.actions,
        meta: { className: "text-center", label: PettyCashFundColumnLabels.actions },
      }),
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: records,
    columns,
    initialState: { columnVisibility: PettyCashFundDefaultColumnVisibility },
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
        isActive: statusFilter === PettyCashFundAllStatusFilter,
        onClick: () => setStatusFilter(PettyCashFundAllStatusFilter),
      },
      ...PettyCashFundRecordStatuses.map((status) => {
        const count = records.filter((item) => item.status === status).length;
        const tone =
          status === PettyCashFundStatuses.Posted
            ? ("emerald" as const)
            : status === PettyCashFundStatuses.ForApproval
              ? ("amber" as const)
              : status === PettyCashFundStatuses.Draft
                ? ("blue" as const)
                : status === PettyCashFundStatuses.Disapproved
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

  const onUpdateStatus = (record: PettyCashFundRecord, status: PettyCashFundStatus) => {
    updateStatusMutation.mutate({ id: record.id, status });
  };

  const onDeleteRecord = (record: PettyCashFundRecord) => {
    deleteMutation.mutate(record.id);
  };

  const refreshRecords = () => {
    fundQuery.refetch();
  };

  return {
    amountRange,
    dateRange,
    filteredRecords: records,
    isLoading: fundQuery.isLoading,
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
