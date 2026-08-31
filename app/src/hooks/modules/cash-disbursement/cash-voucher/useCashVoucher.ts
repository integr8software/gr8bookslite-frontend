"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ReceiptText } from "lucide-react";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  CashVoucherDefaultColumnOrder,
  CashVoucherDefaultColumnVisibility,
  CashVoucherDefaultSorting,
  CashVoucherAllStatusFilter,
  CashVoucherStatusFilters,
  CashVoucherStatuses,
  CashVoucherTableColumns,
  CashVoucherTablePreferencesModuleKey,
  CashVoucherTablePreferencesStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { CashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherQueryKeys";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import {
  getCashVoucherDisplayStatus,
  sanitizeCashVoucherRecord,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";
import type {
  CashVoucherPreviewRow,
  CashVoucherRecord,
  CashVoucherStatus,
  CashVoucherTableColumnKey,
  CashVoucherStoreState,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { useTablePreferences } from "@/app/src/hooks/shared/table-preferences/useTablePreferences";
import {
  deleteCashVoucherApi,
  fetchCashVoucherList,
  updateCashVoucherStatusApi,
} from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherApi";

export function useCashVoucherStore<TSelected = CashVoucherStoreState>(
  selector?: (state: CashVoucherStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);

  const vouchersQuery = useQuery({
    queryKey: CashVoucherQueryKeys.records(activeCompanyId, activeBranchId),
    queryFn: async () => {
      try {
        const response = await fetchCashVoucherList({
          branchUnitId: activeBranchId ?? undefined,
          limit: 500,
        });
        return response.data;
      } catch {
        return [];
      }
    },
    enabled: activeCompanyId !== null,
    initialData: [],
  });

  const refreshRecords = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: CashVoucherQueryKeys.all(activeCompanyId, activeBranchId),
    });
  }, [activeBranchId, activeCompanyId, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CashVoucherStatus }) => {
      return await updateCashVoucherStatusApi(id, status);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<CashVoucherRecord[]>(
        CashVoucherQueryKeys.records(activeCompanyId, activeBranchId),
        (current = []) => current.map((v) => (v.id === updated.id ? updated : v)),
      );
      refreshRecords();
      toast.success("Cash Voucher status updated.");
    },
    onError: () => {
      toast.error("Could not update Cash Voucher status. Please try again.");
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async (voucherId: string) => {
      await deleteCashVoucherApi(voucherId);
      return voucherId;
    },
    onSuccess: (voucherId) => {
      queryClient.setQueryData<CashVoucherRecord[]>(
        CashVoucherQueryKeys.records(activeCompanyId, activeBranchId),
        (current = []) => current.filter((v) => v.id !== voucherId),
      );
      refreshRecords();
      toast.success("Cash Voucher Deleted.");
    },
    onError: () => {
      toast.error("Could not delete Cash Voucher. Please try again.");
    },
  });

  const vouchers = useMemo(() => (vouchersQuery.data || []).map(sanitizeCashVoucherRecord), [vouchersQuery.data]);

  const previewRows = useMemo<CashVoucherPreviewRow[]>(() => {
    return vouchers.map((voucher) => ({
      transaction: {
        id: voucher.id,
        transactionNo: voucher.voucherNo,
        payee: voucher.partyName,
        purpose: voucher.remarks || "",
        department: voucher.costCenter || "",
        projectName: voucher.projectName,
        requestedBy: voucher.preparedBy || "",
        transactionDate: voucher.voucherDate,
        paymentDueDate: voucher.paymentDueDate || voucher.voucherDate,
        amount: voucher.amount,
        disburseAmount: voucher.disburseAmount,
        currency: voucher.currency,
        fxRate: voucher.fxRate,
        paymentMethod: "Cash",
        disbursementType: voucher.disbursementType || "Vendor Payment",
        status: voucher.status,
        costCenter: voucher.costCenter || "",
        createdBy: voucher.createdBy,
        createdAt: voucher.createdAt,
        updatedBy: voucher.updatedBy,
        updatedAt: voucher.updatedAt,
      },
      voucher,
    }));
  }, [vouchers]);

  const state = useMemo<CashVoucherStoreState>(
    () => ({
      previewRows,
      transactions: previewRows.map((r) => r.transaction),
      vouchers,
      addTransaction: () => undefined,
      updateTransaction: (transaction) => {
        if (transaction.id) {
          updateStatusMutation.mutate({ id: transaction.id, status: transaction.status });
        }
      },
      addVoucher: () => {
        refreshRecords();
      },
      updateVoucher: (voucher) => {
        if (voucher.id) {
          updateStatusMutation.mutate({ id: voucher.id, status: voucher.status });
        }
      },
      deleteVoucher: (voucherId) => deleteVoucherMutation.mutate(voucherId),
      isLoading: vouchersQuery.isLoading,
      lastSyncedAt: vouchersQuery.dataUpdatedAt,
      refreshRecords,
      isMutating: updateStatusMutation.isPending || deleteVoucherMutation.isPending,
    }),
    [
      deleteVoucherMutation,
      previewRows,
      refreshRecords,
      updateStatusMutation,
      vouchers,
      vouchersQuery.dataUpdatedAt,
      vouchersQuery.isLoading,
    ],
  );

  return selector ? selector(state) : (state as TSelected);
}

export function useCashVoucherPreviewTable(previewRows: CashVoucherPreviewRow[]) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [query, setQueryState] = useState("");
  const [dateRange, setDateRangeState] = useState<DateRangeValue>({
    from: "",
    to: "",
  });
  const [amountRange, setAmountRangeState] = useState<AmountRangeValue>({
    from: "",
    to: "",
  });
  const { columnOrder, columnVisibility, sorting, setColumnOrder, setColumnVisibility, setSorting } = useTablePreferences({
    defaultColumnOrder: CashVoucherDefaultColumnOrder,
    defaultColumnVisibility: CashVoucherDefaultColumnVisibility,
    defaultSorting: CashVoucherDefaultSorting,
    moduleKey: CashVoucherTablePreferencesModuleKey,
    storageKey: CashVoucherTablePreferencesStorageKey,
  });
  const [statusFilter, setStatusFilterState] =
    useState<(typeof CashVoucherStatusFilters)[number]>(CashVoucherAllStatusFilter);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeLowercaseWhitespace(deferredQuery);
  const filteredRows = useMemo(
    () =>
      previewRows.filter((row) => {
        const searchable = [
          row.transaction.transactionNo,
          row.voucher?.voucherNo,
          row.voucher?.partyCode,
          row.voucher?.partyName,
          row.transaction.payee,
          row.transaction.department,
          row.transaction.purpose,
          row.voucher?.remarks,
          row.voucher?.currency ?? row.transaction.currency,
          row.voucher?.fxRate ?? row.transaction.fxRate,
        ]
          .filter(Boolean)
          .join(" ");
        const rowStatus = getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status);
        const rowDate = row.voucher?.voucherDate ?? row.transaction.transactionDate;
        const rowAmount = row.voucher?.amount ?? row.transaction.amount;

        return (
          normalizeLowercaseWhitespace(searchable).includes(normalizedQuery) &&
          (statusFilter === CashVoucherAllStatusFilter || rowStatus === statusFilter) &&
          isDateInRange(rowDate, dateRange) &&
          isAmountInRange(rowAmount, amountRange)
        );
      }),
    [amountRange, dateRange, normalizedQuery, previewRows, statusFilter],
  );
  const columns = useMemo<ColumnDef<CashVoucherPreviewRow>[]>(
    () =>
      CashVoucherTableColumns.map((column) => {
        if (!("key" in column)) {
          return {
            id: "actions",
            header: column.label,
            enableHiding: false,
            enableSorting: false,
            size: column.size,
            meta: { className: column.className, label: column.label },
          };
        }

        return createCashVoucherColumn(column.key, column.label, column.className, column.size);
      }),
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns the table state lifecycle.
  const table = useReactTable({
    data: filteredRows,
    columns,
    initialState: {
      columnOrder: CashVoucherDefaultColumnOrder,
      columnVisibility: CashVoucherDefaultColumnVisibility,
      sorting: CashVoucherDefaultSorting,
    },
    state: {
      columnOrder,
      columnVisibility,
      pagination,
      sorting,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function setQuery(value: string) {
    setQueryState(value);
    table.setPageIndex(0);
  }

  const setStatusFilter = useCallback((value: (typeof CashVoucherStatusFilters)[number]) => {
    setStatusFilterState(value);
    table.setPageIndex(0);
  }, [table]);

  function setDateRange(value: DateRangeValue) {
    setDateRangeState(value);
    table.setPageIndex(0);
  }

  function setAmountRange(value: AmountRangeValue) {
    setAmountRangeState(value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    setQueryState("");
    setDateRangeState({ from: "", to: "" });
    setAmountRangeState({ from: "", to: "" });
    setStatusFilterState(CashVoucherAllStatusFilter);
    table.setPageIndex(0);
  }

  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => {
    const statusCounts = Object.fromEntries(
      Object.values(CashVoucherStatuses).map((status) => [
        status,
        previewRows.filter(
          (row) => getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status) === status,
        ).length,
      ]),
    ) as Record<CashVoucherStatus, number>;

    return [
      {
        label: "Total Entries",
        value: previewRows.length,
        summary: "All time",
        icon: ReceiptText,
        tone: "violet",
        isActive: statusFilter === CashVoucherAllStatusFilter,
        onClick: () => setStatusFilter(CashVoucherAllStatusFilter),
      },
      ...[
        CashVoucherStatuses.posted,
        CashVoucherStatuses.forApproval,
        CashVoucherStatuses.draft,
        CashVoucherStatuses.disapproved,
        CashVoucherStatuses.cancelled,
      ].map((status, index) => ({
        label: status,
        value: statusCounts[status] ?? 0,
        summary: formatPartOfTotalPercentage(statusCounts[status] ?? 0, previewRows.length),
        icon: getModuleStatusMetricIcon(status),
        iconClassName: getModuleStatusMetricIconClassName(status),
        tone: (["emerald", "amber", "blue", "red", "slate"] as const)[index],
        isActive: statusFilter === status,
        onClick: () => setStatusFilter(status),
      })),
    ];
  }, [previewRows, setStatusFilter, statusFilter]);

  return {
    amountRange,
    dateRange,
    query,
    resetFilters,
    setAmountRange,
    setDateRange,
    setQuery,
    setStatusFilter,
    statisticCards,
    statusFilter,
    statusOptions: CashVoucherStatusFilters,
    table,
  };
}

function isAmountInRange(value: number, range: AmountRangeValue) {
  const fromAmount = range.from.trim() ? parseMoneyNumberInput(range.from) : 0;
  const toAmount = range.to.trim() ? parseMoneyNumberInput(range.to) : Number.MAX_SAFE_INTEGER;

  return value >= fromAmount && value <= toAmount;
}

function isDateInRange(value: string, range: DateRangeValue) {
  if (!range.from && !range.to) {
    return true;
  }

  if (!value) {
    return false;
  }

  const dateTime = new Date(value).setHours(0, 0, 0, 0);
  const fromTime = range.from ? new Date(range.from).setHours(0, 0, 0, 0) : null;
  const toTime = range.to ? new Date(range.to).setHours(0, 0, 0, 0) : null;

  if (fromTime !== null && dateTime < fromTime) {
    return false;
  }

  if (toTime !== null && dateTime > toTime) {
    return false;
  }

  return true;
}

function createCashVoucherColumn(
  key: CashVoucherTableColumnKey,
  header: string,
  className: string,
  size: number,
): ColumnDef<CashVoucherPreviewRow> {
  return {
    id: key,
    accessorFn: (row) => getCashVoucherColumnValue(row, key),
    header,
    size,
    sortingFn:
      key === "documentDate" || key === "createdAt" || key === "updatedAt"
        ? "datetime"
        : key === "amount" || key === "disburseAmount"
          ? "basic"
          : "alphanumeric",
    meta: { className, label: header },
  };
}

function getCashVoucherColumnValue(row: CashVoucherPreviewRow, key: CashVoucherTableColumnKey) {
  switch (key) {
    case "voucherNo":
      return row.voucher?.voucherNo ?? row.transaction.transactionNo;
    case "documentDate":
      return row.voucher?.voucherDate ?? row.transaction.transactionDate;
    case "partyName":
      return row.voucher?.partyName || row.transaction.payee;
    case "partyCode":
      return row.voucher?.partyCode || "";
    case "remarks":
      return row.voucher?.remarks ?? row.transaction.purpose;
    case "currency":
      return row.voucher?.currency ?? row.transaction.currency;
    case "exchangeRate":
      return row.voucher?.fxRate ?? row.transaction.fxRate ?? "";
    case "amount":
      return row.voucher?.amount ?? row.transaction.amount;
    case "disburseAmount":
      return row.voucher?.disburseAmount ?? row.voucher?.amount ?? row.transaction.amount;
    case "status":
      return getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status);
    case "createdBy":
      return row.voucher?.createdBy ?? row.transaction.createdBy ?? "";
    case "createdAt":
      return row.voucher?.createdAt ?? row.transaction.createdAt ?? "";
    case "updatedBy":
      return row.voucher?.updatedBy ?? row.transaction.updatedBy ?? "";
    case "updatedAt":
      return row.voucher?.updatedAt ?? row.transaction.updatedAt ?? "";
    default:
      return "";
  }
}
