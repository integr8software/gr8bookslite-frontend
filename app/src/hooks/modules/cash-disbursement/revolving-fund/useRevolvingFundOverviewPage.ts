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
  RevolvingFundAllStatusFilter,
  RevolvingFundColumnLabels,
  RevolvingFundDefaultColumnVisibility,
  RevolvingFundRecordStatuses,
  RevolvingFundStatuses,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { RevolvingFundQueryKeys } from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundQueryKeys";
import type { RevolvingFundRecord, RevolvingFundStatus } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { parseAmount } from "@/app/src/utils/number.util";
import {
  deleteRevolvingFundApi,
  fetchRevolvingFundList,
  updateRevolvingFundStatusApi,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundApi";

const columnHelper = createColumnHelper<RevolvingFundRecord>();

export function useRevolvingFundOverviewPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(RevolvingFundAllStatusFilter);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => RevolvingFundDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  const amountFrom = parseAmount(amountRange.from);
  const amountTo = parseAmount(amountRange.to);

  const fundQuery = useQuery({
    queryKey: RevolvingFundQueryKeys.list({
      query,
      statusFilter,
      startDate: dateRange.from || undefined,
      endDate: dateRange.to || undefined,
      amountFrom: amountFrom !== null ? amountFrom : undefined,
      amountTo: amountTo !== null ? amountTo : undefined,
    }),
    queryFn: async () => {
      const res = await fetchRevolvingFundList({
        search: query || undefined,
        status: statusFilter !== RevolvingFundAllStatusFilter ? statusFilter : undefined,
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
    mutationFn: async ({ id, status }: { id: string; status: RevolvingFundStatus }) => {
      return await updateRevolvingFundStatusApi(id, status);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: RevolvingFundQueryKeys.all });
      toast.success(`Revolving Fund marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update the Revolving Fund status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteRevolvingFundApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RevolvingFundQueryKeys.all });
      toast.success("Revolving Fund deleted successfully.");
    },
    onError: () => {
      toast.error("Could not delete Revolving Fund.");
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", {
        header: RevolvingFundColumnLabels.transactionNo,
        size: TransactionOverviewColumnWidths.transactionNumber,
        meta: { label: RevolvingFundColumnLabels.transactionNo },
      }),
      columnHelper.accessor("documentDate", {
        header: RevolvingFundColumnLabels.documentDate,
        size: TransactionOverviewColumnWidths.documentDate,
        meta: { label: RevolvingFundColumnLabels.documentDate },
      }),
      columnHelper.accessor("partyCode", {
        header: RevolvingFundColumnLabels.partyCode,
        size: TransactionOverviewColumnWidths.partyCode,
        meta: { label: RevolvingFundColumnLabels.partyCode },
      }),
      columnHelper.accessor("partyName", {
        header: RevolvingFundColumnLabels.partyName,
        size: TransactionOverviewColumnWidths.partyName,
        meta: { label: RevolvingFundColumnLabels.partyName },
      }),
      columnHelper.accessor("accountCode", {
        header: RevolvingFundColumnLabels.accountCode,
        size: TransactionOverviewColumnWidths.accountCode,
        meta: { label: RevolvingFundColumnLabels.accountCode },
      }),
      columnHelper.accessor("accountTitle", {
        header: RevolvingFundColumnLabels.accountTitle,
        size: TransactionOverviewColumnWidths.accountTitle,
        meta: { label: RevolvingFundColumnLabels.accountTitle },
      }),
      columnHelper.accessor("amount", {
        header: RevolvingFundColumnLabels.amount,
        size: TransactionOverviewColumnWidths.amount,
        meta: { label: RevolvingFundColumnLabels.amount },
      }),
      columnHelper.accessor("disburseAmount", {
        header: RevolvingFundColumnLabels.disburseAmount,
        size: TransactionOverviewColumnWidths.amount,
        meta: { label: RevolvingFundColumnLabels.disburseAmount },
      }),
      columnHelper.accessor("remarks", {
        header: RevolvingFundColumnLabels.remarks,
        size: TransactionOverviewColumnWidths.remarks,
        meta: { label: RevolvingFundColumnLabels.remarks },
      }),
      columnHelper.accessor("createdBy", {
        header: RevolvingFundColumnLabels.createdBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: RevolvingFundColumnLabels.createdBy },
      }),
      columnHelper.accessor("createdAt", {
        header: RevolvingFundColumnLabels.createdAt,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: RevolvingFundColumnLabels.createdAt },
      }),
      columnHelper.accessor("updatedBy", {
        header: RevolvingFundColumnLabels.updatedBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: RevolvingFundColumnLabels.updatedBy },
      }),
      columnHelper.accessor("updatedAt", {
        header: RevolvingFundColumnLabels.updatedAt,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: RevolvingFundColumnLabels.updatedAt },
      }),
      columnHelper.accessor("status", {
        header: RevolvingFundColumnLabels.status,
        size: TransactionOverviewColumnWidths.status,
        meta: { className: "text-center", label: RevolvingFundColumnLabels.status },
      }),
      columnHelper.display({
        id: "actions",
        header: RevolvingFundColumnLabels.actions,
        size: TransactionOverviewColumnWidths.actions,
        meta: { className: "text-center", label: RevolvingFundColumnLabels.actions },
      }),
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: records,
    columns,
    initialState: { columnVisibility: RevolvingFundDefaultColumnVisibility },
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
        isActive: statusFilter === RevolvingFundAllStatusFilter,
        onClick: () => setStatusFilter(RevolvingFundAllStatusFilter),
      },
      ...RevolvingFundRecordStatuses.map((status) => {
        const count = records.filter((item) => item.status === status).length;
        const tone =
          status === RevolvingFundStatuses.Posted
            ? ("emerald" as const)
            : status === RevolvingFundStatuses.ForApproval
              ? ("amber" as const)
              : status === RevolvingFundStatuses.Draft
                ? ("blue" as const)
                : status === RevolvingFundStatuses.Disapproved
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

  const onUpdateStatus = (record: RevolvingFundRecord, status: RevolvingFundStatus) => {
    updateStatusMutation.mutate({ id: record.id, status });
  };

  const onDeleteRecord = (record: RevolvingFundRecord) => {
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
