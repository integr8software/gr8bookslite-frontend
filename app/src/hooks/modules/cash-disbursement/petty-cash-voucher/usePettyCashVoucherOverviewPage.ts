"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ReceiptText } from "lucide-react";
import toast from "react-hot-toast";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import {
  PettyCashVoucherColumnLabels,
  PettyCashVoucherAllStatusFilter,
  PettyCashVoucherDefaultColumnVisibility,
  PettyCashVoucherRecordStatuses,
  PettyCashVoucherStatusOptions,
  PettyCashVoucherStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { PettyCashVoucherQueryKeys } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { parseAmount } from "@/app/src/utils/number.util";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import {
  deletePettyCashVoucherApi,
  fetchPettyCashVoucherList,
  updatePettyCashVoucherStatusApi,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherApi";

const columnHelper = createColumnHelper<PettyCashVoucherRecord>();

export function usePettyCashVoucherOverviewPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<typeof PettyCashVoucherAllStatusFilter | PettyCashVoucherStatus>(
    PettyCashVoucherAllStatusFilter,
  );
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [columnVisibility, setColumnVisibility] = useState(() => PettyCashVoucherDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  const amountFrom = parseAmount(amountRange.from);
  const amountTo = parseAmount(amountRange.to);

  const vouchersQuery = useQuery({
    queryKey: [
      ...PettyCashVoucherQueryKeys.vouchers(),
      {
        search: searchQuery,
        status: statusFilter,
        startDate: dateRange.from || undefined,
        endDate: dateRange.to || undefined,
        amountFrom: amountFrom !== null ? amountFrom : undefined,
        amountTo: amountTo !== null ? amountTo : undefined,
      },
    ],
    queryFn: async () => {
      const res = await fetchPettyCashVoucherList({
        search: searchQuery || undefined,
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

  const vouchers = useMemo(() => vouchersQuery.data?.data ?? [], [vouchersQuery.data?.data]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, voucherId }: { status: PettyCashVoucherStatus; voucherId: string }) => {
      return await updatePettyCashVoucherStatusApi(voucherId, status);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: PettyCashVoucherQueryKeys.vouchers() });
      toast.success(`Petty Cash Voucher marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update the Petty Cash Voucher status. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      return await deletePettyCashVoucherApi(voucherId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PettyCashVoucherQueryKeys.vouchers() });
      toast.success("Petty Cash Voucher deleted successfully.");
    },
    onError: () => {
      toast.error("Could not delete Petty Cash Voucher.");
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("voucherNo", {
        header: PettyCashVoucherColumnLabels.voucherNo,
        size: TransactionOverviewColumnWidths.transactionNumber,
        meta: { label: PettyCashVoucherColumnLabels.voucherNo },
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
      columnHelper.accessor("status", {
        header: PettyCashVoucherColumnLabels.status,
        size: TransactionOverviewColumnWidths.status,
        meta: { label: PettyCashVoucherColumnLabels.status },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: vouchers,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => {
    const totalCount = vouchers.length;
    return [
      {
        label: "Total Entries",
        value: totalCount,
        icon: ReceiptText,
        tone: "violet",
        summary: "All time",
        isActive: statusFilter === PettyCashVoucherAllStatusFilter,
        onClick: () => setStatusFilter(PettyCashVoucherAllStatusFilter),
      },
      ...PettyCashVoucherRecordStatuses.map((status) => {
        const count = vouchers.filter((v) => v.status === status).length;
        const tone =
          status === PettyCashVoucherStatuses.posted
            ? ("emerald" as const)
            : status === PettyCashVoucherStatuses.forApproval
              ? ("amber" as const)
              : status === PettyCashVoucherStatuses.draft
                ? ("blue" as const)
                : status === PettyCashVoucherStatuses.disapproved
                  ? ("red" as const)
                  : ("slate" as const);

        return {
          label: status,
          value: count,
          icon: getModuleStatusMetricIcon(status),
          iconClassName: getModuleStatusMetricIconClassName(status),
          tone,
          summary: formatPartOfTotalPercentage(count, totalCount),
          isActive: statusFilter === status,
          onClick: () => setStatusFilter(status),
        };
      }),
    ];
  }, [statusFilter, vouchers]);

  const onUpdateStatus = (record: PettyCashVoucherRecord, status: PettyCashVoucherStatus) => {
    updateStatusMutation.mutate({ status, voucherId: record.id });
  };

  const refreshRecords = () => {
    vouchersQuery.refetch();
  };

  return {
    amountRange,
    columns,
    dateRange,
    filteredVouchers: vouchers,
    handleUpdateStatus: onUpdateStatus,
    hasActiveFilters: Boolean(
      searchQuery ||
        statusFilter !== PettyCashVoucherAllStatusFilter ||
        dateRange.from ||
        dateRange.to ||
        amountRange.from ||
        amountRange.to,
    ),
    isLoading: vouchersQuery.isLoading,
    isUpdatingStatus: updateStatusMutation.isPending || deleteMutation.isPending,
    lastSyncedAt,
    onDeleteRecord: (record: PettyCashVoucherRecord) => deleteMutation.mutate(record.id),
    onUpdateStatus,
    updateStatus: onUpdateStatus,
    refreshRecords,
    searchQuery,
    setAmountRange,
    setDateRange,
    setSearchQuery,
    setStatusFilter,
    statisticCards,
    statistics: statisticCards,
    statusFilter,
    statusOptions: PettyCashVoucherStatusOptions,
    table,
    updateStatusMutation,
  };
}
