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
  PettyCashVoucherAllStatusFilter,
  PettyCashVoucherColumnLabels,
  PettyCashVoucherDefaultColumnVisibility,
  PettyCashVoucherRecordStatuses,
  PettyCashVoucherStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { PettyCashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherQueryKeys";
import type {
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { parseAmount } from "@/app/src/utils/number.util";
import {
  deletePettyCashVoucherApi,
  fetchPettyCashVoucherList,
  updatePettyCashVoucherStatusApi,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherApi";

const columnHelper = createColumnHelper<PettyCashVoucherRecord>();

export function usePettyCashVoucherOverviewPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(PettyCashVoucherAllStatusFilter);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => PettyCashVoucherDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  const amountFrom = parseAmount(amountRange.from);
  const amountTo = parseAmount(amountRange.to);

  const fundQuery = useQuery({
    queryKey: PettyCashVoucherQueryKeys.list({
      query,
      statusFilter,
      startDate: dateRange.from || undefined,
      endDate: dateRange.to || undefined,
      amountFrom: amountFrom !== null ? amountFrom : undefined,
      amountTo: amountTo !== null ? amountTo : undefined,
    }),
    queryFn: async () => {
      const res = await fetchPettyCashVoucherList({
        search: query || undefined,
        status: statusFilter !== PettyCashVoucherAllStatusFilter ? statusFilter : undefined,
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
    mutationFn: async ({ id, status }: { id: string; status: PettyCashVoucherStatus }) => {
      return await updatePettyCashVoucherStatusApi(id, status);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: PettyCashVoucherQueryKeys.all });
      toast.success(`Petty Cash Voucher marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update the Petty Cash Voucher status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deletePettyCashVoucherApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PettyCashVoucherQueryKeys.all });
      toast.success("Petty Cash Voucher deleted successfully.");
    },
    onError: () => {
      toast.error("Could not delete Petty Cash Voucher.");
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", {
        header: PettyCashVoucherColumnLabels.transactionNo,
        size: TransactionOverviewColumnWidths.transactionNumber,
        meta: { label: PettyCashVoucherColumnLabels.transactionNo },
      }),
      columnHelper.accessor("documentDate", {
        header: PettyCashVoucherColumnLabels.documentDate,
        size: TransactionOverviewColumnWidths.documentDate,
        meta: { label: PettyCashVoucherColumnLabels.documentDate },
      }),
      columnHelper.accessor("partyCode", {
        header: PettyCashVoucherColumnLabels.partyCode,
        size: TransactionOverviewColumnWidths.partyCode,
        meta: { label: PettyCashVoucherColumnLabels.partyCode },
      }),
      columnHelper.accessor("partyName", {
        header: PettyCashVoucherColumnLabels.partyName,
        size: TransactionOverviewColumnWidths.partyName,
        meta: { label: PettyCashVoucherColumnLabels.partyName },
      }),
      columnHelper.accessor("accountCode", {
        header: PettyCashVoucherColumnLabels.accountCode,
        size: TransactionOverviewColumnWidths.accountCode,
        meta: { label: PettyCashVoucherColumnLabels.accountCode },
      }),
      columnHelper.accessor("accountTitle", {
        header: PettyCashVoucherColumnLabels.accountTitle,
        size: TransactionOverviewColumnWidths.accountTitle,
        meta: { label: PettyCashVoucherColumnLabels.accountTitle },
      }),
      columnHelper.accessor("amount", {
        header: PettyCashVoucherColumnLabels.amount,
        size: TransactionOverviewColumnWidths.amount,
        meta: { label: PettyCashVoucherColumnLabels.amount },
      }),
      columnHelper.accessor("disburseAmount", {
        header: PettyCashVoucherColumnLabels.disburseAmount,
        size: TransactionOverviewColumnWidths.amount,
        meta: { label: PettyCashVoucherColumnLabels.disburseAmount },
      }),
      columnHelper.accessor("remarks", {
        header: PettyCashVoucherColumnLabels.remarks,
        size: TransactionOverviewColumnWidths.remarks,
        meta: { label: PettyCashVoucherColumnLabels.remarks },
      }),
      columnHelper.accessor("createdBy", {
        header: PettyCashVoucherColumnLabels.createdBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: PettyCashVoucherColumnLabels.createdBy },
      }),
      columnHelper.accessor("createdAt", {
        header: PettyCashVoucherColumnLabels.createdAt,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: PettyCashVoucherColumnLabels.createdAt },
      }),
      columnHelper.accessor("updatedBy", {
        header: PettyCashVoucherColumnLabels.updatedBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: PettyCashVoucherColumnLabels.updatedBy },
      }),
      columnHelper.accessor("updatedAt", {
        header: PettyCashVoucherColumnLabels.updatedAt,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: PettyCashVoucherColumnLabels.updatedAt },
      }),
      columnHelper.accessor("status", {
        header: PettyCashVoucherColumnLabels.status,
        size: TransactionOverviewColumnWidths.status,
        meta: { className: "text-center", label: PettyCashVoucherColumnLabels.status },
      }),
      columnHelper.display({
        id: "actions",
        header: PettyCashVoucherColumnLabels.actions,
        size: TransactionOverviewColumnWidths.actions,
        meta: { className: "text-center", label: PettyCashVoucherColumnLabels.actions },
      }),
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: records,
    columns,
    initialState: { columnVisibility: PettyCashVoucherDefaultColumnVisibility },
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
        isActive: statusFilter === PettyCashVoucherAllStatusFilter,
        onClick: () => setStatusFilter(PettyCashVoucherAllStatusFilter),
      },
      ...PettyCashVoucherRecordStatuses.map((status) => {
        const count = records.filter((item) => item.status === status).length;
        const tone =
          status === PettyCashVoucherStatuses.Posted
            ? ("emerald" as const)
            : status === PettyCashVoucherStatuses.ForApproval
              ? ("amber" as const)
              : status === PettyCashVoucherStatuses.Draft
                ? ("blue" as const)
                : status === PettyCashVoucherStatuses.Disapproved
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

  const onUpdateStatus = (record: PettyCashVoucherRecord, status: PettyCashVoucherStatus) => {
    updateStatusMutation.mutate({ id: record.id, status });
  };

  const onDeleteRecord = (record: PettyCashVoucherRecord) => {
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
