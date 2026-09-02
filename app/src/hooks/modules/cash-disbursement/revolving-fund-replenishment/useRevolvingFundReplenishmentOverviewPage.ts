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
  RevolvingFundReplenishmentColumnLabels,
  RevolvingFundReplenishmentDefaultColumnVisibility,
  RevolvingFundReplenishmentOverviewColumnWidths,
  RevolvingFundReplenishmentRecordStatuses,
  RevolvingFundReplenishmentStatuses,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import {
  CashDisbursementAllStatusFilter,
  CashDisbursementAllTimeSummary,
  CashDisbursementTotalEntriesLabel,
  createCashDisbursementListQueryKey,
  createCashDisbursementModuleQueryKey,
} from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import type {
  RevolvingFundReplenishmentRecord,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { parseAmount } from "@/app/src/utils/number.util";
import {
  deleteRevolvingFundReplenishmentApi,
  fetchRevolvingFundReplenishmentList,
  updateRevolvingFundReplenishmentStatusApi,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentApi";

const columnHelper = createColumnHelper<RevolvingFundReplenishmentRecord>();
const RevolvingFundReplenishmentQueryKey = "revolving-fund-replenishment";

export function useRevolvingFundReplenishmentOverviewPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(CashDisbursementAllStatusFilter);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => RevolvingFundReplenishmentDefaultColumnVisibility);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());

  const amountFrom = parseAmount(amountRange.from);
  const amountTo = parseAmount(amountRange.to);

  const listQuery = useQuery({
    queryKey: createCashDisbursementListQueryKey(RevolvingFundReplenishmentQueryKey, {
      query,
      statusFilter,
      startDate: dateRange.from || undefined,
      endDate: dateRange.to || undefined,
      amountFrom: amountFrom !== null ? amountFrom : undefined,
      amountTo: amountTo !== null ? amountTo : undefined,
    }),
    queryFn: async () => {
      const res = await fetchRevolvingFundReplenishmentList({
        search: query || undefined,
        status: statusFilter !== CashDisbursementAllStatusFilter ? statusFilter : undefined,
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
    mutationFn: async ({ id, status }: { id: string; status: RevolvingFundReplenishmentStatus }) => {
      return await updateRevolvingFundReplenishmentStatusApi(id, status);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: createCashDisbursementModuleQueryKey(RevolvingFundReplenishmentQueryKey) });
      toast.success(`Revolving Fund Replenishment marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update the Revolving Fund Replenishment status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteRevolvingFundReplenishmentApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createCashDisbursementModuleQueryKey(RevolvingFundReplenishmentQueryKey) });
      toast.success("Revolving Fund Replenishment deleted successfully.");
    },
    onError: () => {
      toast.error("Could not delete Revolving Fund Replenishment.");
    },
  });

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
      columnHelper.accessor("disburseAmount", {
        header: RevolvingFundReplenishmentColumnLabels.disburseAmount,
        size: RevolvingFundReplenishmentOverviewColumnWidths.disburseAmount,
        meta: { label: RevolvingFundReplenishmentColumnLabels.disburseAmount },
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

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: records,
    columns,
    initialState: { columnVisibility: RevolvingFundReplenishmentDefaultColumnVisibility },
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
        label: CashDisbursementTotalEntriesLabel,
        value: total,
        icon: ReceiptText,
        tone: "violet",
        summary: CashDisbursementAllTimeSummary,
        isActive: statusFilter === CashDisbursementAllStatusFilter,
        onClick: () => setStatusFilter(CashDisbursementAllStatusFilter),
      },
      ...RevolvingFundReplenishmentRecordStatuses.map((status) => {
        const count = records.filter((item) => item.status === status).length;
        const tone =
          status === RevolvingFundReplenishmentStatuses.posted
            ? ("emerald" as const)
            : status === RevolvingFundReplenishmentStatuses.forApproval
              ? ("amber" as const)
              : status === RevolvingFundReplenishmentStatuses.draft
                ? ("blue" as const)
                : status === RevolvingFundReplenishmentStatuses.disapproved
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

  const onUpdateStatus = (record: RevolvingFundReplenishmentRecord, status: RevolvingFundReplenishmentStatus) => {
    updateStatusMutation.mutate({ id: record.id, status });
  };

  const onDeleteRecord = (record: RevolvingFundReplenishmentRecord) => {
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
