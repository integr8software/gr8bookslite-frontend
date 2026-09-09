"use client";

import { useCallback, useMemo, useState } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AdvancesToSuppliersAllStatusFilter,
  AdvancesToSuppliersColumnLabels,
  AdvancesToSuppliersDefaultColumnVisibility,
  AdvancesToSuppliersOverviewColumnWidths,
  AdvancesToSuppliersRecordStatuses,
  AdvancesToSuppliersStatuses,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import {
  fetchAdvancesToSuppliersList,
  submitAdvancesToSuppliersApprovalApi,
  updateAdvancesToSuppliersStatusApi,
} from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersService";
import { AdvancesToSuppliersQueryKeys } from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
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
const EmptyAdvancesToSuppliersRecords: AdvancesToSuppliersRecord[] = [];

export function useAdvancesToSuppliersOverviewPage() {
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(AdvancesToSuppliersAllStatusFilter);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [amountRange, setAmountRange] = useState<AmountRangeValue>({ from: "", to: "" });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => AdvancesToSuppliersDefaultColumnVisibility);
  const recordsQueryKey = useMemo(() => AdvancesToSuppliersQueryKeys.records(activeCompanyId), [activeCompanyId]);
  const allQueryKey = AdvancesToSuppliersQueryKeys.all;
  const recordsQuery = useQuery({
    queryKey: recordsQueryKey,
    queryFn: async () => {
      try {
        const response = await fetchAdvancesToSuppliersList({ limit: 100 });
        return response.data ?? [];
      } catch {
        toast.error("Could not load Advances to Suppliers records.");
        return [];
      }
    },
    enabled: activeCompanyId !== null,
  });
  const records = recordsQuery.data ?? EmptyAdvancesToSuppliersRecords;
  const refreshRecords = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: allQueryKey });
  }, [allQueryKey, queryClient]);
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdvancesToSuppliersStatus }) => {
      return status === AdvancesToSuppliersStatuses.ForApproval
        ? await submitAdvancesToSuppliersApprovalApi(id)
        : await updateAdvancesToSuppliersStatusApi(id, status);
    },
    onSuccess: (updatedRecord, variables) => {
      queryClient.setQueryData<AdvancesToSuppliersRecord[]>(recordsQueryKey, (currentRecords = []) =>
        currentRecords.map((item) => (item.id === updatedRecord.id ? updatedRecord : item)),
      );
      refreshRecords();
      toast.success(`Advances to Suppliers Marked as ${variables.status}.`);
    },
    onError: () => toast.error("Could not update the Advances to Suppliers status."),
  });
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
          record.currency,
          record.exchangeRate,
          record.formValues?.currency,
          record.formValues?.exchangeRate,
          record.poReference,
          record.remarks,
        ].join(" "),
      );
      return (
        (!needle || searchableText.includes(needle)) &&
        (statusFilter === AdvancesToSuppliersAllStatusFilter || record.status === statusFilter) &&
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
      columnHelper.accessor((record) => record.currency ?? record.formValues?.currency ?? "PHP", {
        id: "currency",
        header: AdvancesToSuppliersColumnLabels.currency,
        size: AdvancesToSuppliersOverviewColumnWidths.currency,
        meta: { label: AdvancesToSuppliersColumnLabels.currency },
      }),
      columnHelper.accessor((record) => record.exchangeRate ?? record.formValues?.exchangeRate ?? "1.00", {
        id: "exchangeRate",
        header: AdvancesToSuppliersColumnLabels.exchangeRate,
        size: AdvancesToSuppliersOverviewColumnWidths.exchangeRate,
        meta: { label: AdvancesToSuppliersColumnLabels.exchangeRate },
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
        onClick: () => setStatusFilter(AdvancesToSuppliersAllStatusFilter),
        isActive: statusFilter === AdvancesToSuppliersAllStatusFilter,
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
    updateStatusMutation.mutate({ id: record.id, status });
  }

  return {
    amountRange,
    dateRange,
    isLoading: recordsQuery.isLoading,
    lastSyncedAt: recordsQuery.dataUpdatedAt,
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
  if (status === AdvancesToSuppliersStatuses.Posted) return "emerald" as const;
  if (status === AdvancesToSuppliersStatuses.ForApproval) return "amber" as const;
  if (status === AdvancesToSuppliersStatuses.Disapproved) return "red" as const;
  if (status === AdvancesToSuppliersStatuses.Cancelled) return "slate" as const;
  return "blue" as const;
}
