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
  PettyCashVoucherStatusMetricTones,
  PettyCashVoucherStatusOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { PettyCashVoucherRecords } from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import { PettyCashVoucherQueryKeys } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { coerceDate } from "@/app/src/utils/date.util";
import { parseAmount } from "@/app/src/utils/number.util";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

const columnHelper = createColumnHelper<PettyCashVoucherRecord>();

export function usePettyCashVoucherOverviewPage() {
  const queryClient = useQueryClient();
  const vouchersQuery = useQuery({
    queryKey: PettyCashVoucherQueryKeys.vouchers(),
    queryFn: async () => PettyCashVoucherRecords,
    initialData: PettyCashVoucherRecords,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<typeof PettyCashVoucherAllStatusFilter | PettyCashVoucherStatus>(
    PettyCashVoucherAllStatusFilter,
  );
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [columnVisibility, setColumnVisibility] = useState(() => PettyCashVoucherDefaultColumnVisibility);
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, voucherId }: { status: PettyCashVoucherStatus; voucherId: string }) => ({ status, voucherId }),
    onSuccess: ({ status, voucherId }) => {
      queryClient.setQueryData<PettyCashVoucherRecord[]>(PettyCashVoucherQueryKeys.vouchers(), (current = PettyCashVoucherRecords) =>
        current.map((voucher) => (voucher.id === voucherId ? { ...voucher, status } : voucher)),
      );
      toast.success(`Petty Cash Voucher Marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update the voucher status. Please try again.");
    },
  });

  const filteredVouchers = useMemo(() => {
    const dateFrom = coerceDate(dateRange.from);
    const dateTo = coerceDate(dateRange.to);
    const amountFrom = parseAmount(amountRange.from);
    const amountTo = parseAmount(amountRange.to);

    return vouchersQuery.data.filter((voucher) => {
      const query = searchQuery.toLowerCase();
      const documentDate = coerceDate(voucher.documentDate);
      const matchesSearch =
        voucher.voucherNo.toLowerCase().includes(query) ||
        voucher.partyCode.toLowerCase().includes(query) ||
        voucher.partyName.toLowerCase().includes(query) ||
        voucher.accountCode.toLowerCase().includes(query) ||
        voucher.accountTitle.toLowerCase().includes(query);

      const matchesStatus = statusFilter === PettyCashVoucherAllStatusFilter || voucher.status === statusFilter;
      const matchesDateFrom = !dateFrom || !documentDate || documentDate >= dateFrom;
      const matchesDateTo = !dateTo || !documentDate || documentDate <= dateTo;
      const matchesAmountFrom = amountFrom === null || voucher.amount >= amountFrom;
      const matchesAmountTo = amountTo === null || voucher.amount <= amountTo;

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesAmountFrom && matchesAmountTo;
    });
  }, [amountRange.from, amountRange.to, dateRange.from, dateRange.to, searchQuery, statusFilter, vouchersQuery.data]);

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
      columnHelper.accessor("dateCreated", {
        header: PettyCashVoucherColumnLabels.dateCreated,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: PettyCashVoucherColumnLabels.dateCreated },
      }),
      columnHelper.accessor("updatedBy", {
        header: PettyCashVoucherColumnLabels.updatedBy,
        size: TransactionOverviewColumnWidths.auditUser,
        meta: { label: PettyCashVoucherColumnLabels.updatedBy },
      }),
      columnHelper.accessor("dateModified", {
        header: PettyCashVoucherColumnLabels.dateModified,
        size: TransactionOverviewColumnWidths.auditDate,
        meta: { label: PettyCashVoucherColumnLabels.dateModified },
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

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    columns,
    data: filteredVouchers,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: PettyCashVoucherDefaultColumnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => {
    function statusMetric(status: PettyCashVoucherStatus) {
      const value = vouchersQuery.data.filter((voucher) => voucher.status === status).length;

      return {
        icon: getModuleStatusMetricIcon(status),
        iconClassName: getModuleStatusMetricIconClassName(status),
        label: status,
        summary: formatPartOfTotalPercentage(value, vouchersQuery.data.length),
        tone: PettyCashVoucherStatusMetricTones[status],
        value,
      };
    }

    return [
      {
        icon: ReceiptText,
        label: "Total Entries",
        summary: "All time",
        tone: "violet" as const,
        value: vouchersQuery.data.length,
      },
      ...PettyCashVoucherRecordStatuses.map(statusMetric),
    ].map((item) => ({
      ...item,
      isActive: item.label === "Total Entries" ? statusFilter === PettyCashVoucherAllStatusFilter : item.label === statusFilter,
      onClick:
        item.label === "Total Entries"
          ? () => setStatusFilter(PettyCashVoucherAllStatusFilter)
          : () => setStatusFilter(item.label as PettyCashVoucherStatus),
    }));
  }, [statusFilter, vouchersQuery.data]);

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter(PettyCashVoucherAllStatusFilter);
    setDateRange({ from: "", to: "" });
    setAmountRange({ from: "", to: "" });
  }

  function refreshRecords() {
    void vouchersQuery.refetch();
  }

  function updateStatusFilter(value: string) {
    if (PettyCashVoucherStatusOptions.includes(value as PettyCashVoucherStatus)) {
      setStatusFilter(value as typeof PettyCashVoucherAllStatusFilter | PettyCashVoucherStatus);
    }
  }

  function handleUpdateStatus(voucher: PettyCashVoucherRecord, status: PettyCashVoucherStatus) {
    return updateStatusMutation
      .mutateAsync({ status, voucherId: voucher.id })
      .then(() => undefined)
      .catch(() => undefined);
  }

  return {
    amountRange,
    dateRange,
    handleUpdateStatus,
    isLoading: vouchersQuery.isLoading,
    isMutating: updateStatusMutation.isPending,
    lastSyncedAt: vouchersQuery.dataUpdatedAt,
    refreshRecords,
    searchQuery,
    resetFilters,
    setAmountRange,
    setDateRange,
    setSearchQuery,
    setStatusFilter: updateStatusFilter,
    statisticCards,
    statusFilter,
    table,
  };
}

