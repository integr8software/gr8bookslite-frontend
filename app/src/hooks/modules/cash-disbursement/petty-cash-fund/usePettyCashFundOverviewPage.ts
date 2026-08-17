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
  PettyCashFundColumnLabels,
  PettyCashFundDefaultColumnVisibility,
  PettyCashFundRecordStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import {
  getPettyCashFundRecords,
  savePettyCashFundRecords,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundService";
import type {
  PettyCashFundRecord,
  PettyCashFundStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  getModuleStatusMetricIcon,
  getModuleStatusMetricIconClassName,
} from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import { CashDisbursementOverviewActionColumnWidth } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";

const columnHelper = createColumnHelper<PettyCashFundRecord>();
const emptyDateRange: DateRangeValue = { from: "", to: "" };
const emptyAmountRange: AmountRangeValue = { from: "", to: "" };

export function usePettyCashFundOverviewPage() {
  const [records, setRecords] = useState(getPettyCashFundRecords);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>(emptyDateRange);
  const [amountRange, setAmountRange] = useState<AmountRangeValue>(emptyAmountRange);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => PettyCashFundDefaultColumnVisibility,
  );
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const filteredRecords = useMemo(
    () => records.filter((record) => {
      const needle = query.trim().toLowerCase();
      return (
        (!needle ||
          [record.transactionNo, record.partyCode, record.partyName, record.accountCode, record.accountTitle, record.remarks]
            .join(" ")
            .toLowerCase()
            .includes(needle)) &&
        (statusFilter === "All" || record.status === statusFilter) &&
        (!dateRange.from || record.documentDate >= dateRange.from) &&
        (!dateRange.to || record.documentDate <= dateRange.to) &&
        (!amountRange.from || record.amount >= Number(amountRange.from)) &&
        (!amountRange.to || record.amount <= Number(amountRange.to))
      );
    }),
    [amountRange, dateRange, query, records, statusFilter],
  );
  const columns = useMemo(() => [
    columnHelper.accessor("transactionNo", { header: PettyCashFundColumnLabels.transactionNo, size: TransactionOverviewColumnWidths.transactionNumber, meta: { label: PettyCashFundColumnLabels.transactionNo } }),
    columnHelper.accessor("documentDate", { header: PettyCashFundColumnLabels.documentDate, size: TransactionOverviewColumnWidths.documentDate, meta: { label: PettyCashFundColumnLabels.documentDate } }),
    columnHelper.accessor("partyCode", { header: PettyCashFundColumnLabels.partyCode, size: TransactionOverviewColumnWidths.partyCode, meta: { label: PettyCashFundColumnLabels.partyCode } }),
    columnHelper.accessor("partyName", { header: PettyCashFundColumnLabels.partyName, size: TransactionOverviewColumnWidths.partyName, meta: { label: PettyCashFundColumnLabels.partyName } }),
    columnHelper.accessor("accountCode", { header: PettyCashFundColumnLabels.accountCode, size: TransactionOverviewColumnWidths.accountCode, meta: { label: PettyCashFundColumnLabels.accountCode } }),
    columnHelper.accessor("accountTitle", { header: PettyCashFundColumnLabels.accountTitle, size: TransactionOverviewColumnWidths.accountTitle, meta: { label: PettyCashFundColumnLabels.accountTitle } }),
    columnHelper.accessor("amount", { header: PettyCashFundColumnLabels.amount, size: TransactionOverviewColumnWidths.amount, meta: { label: PettyCashFundColumnLabels.amount } }),
    columnHelper.accessor("remarks", { header: PettyCashFundColumnLabels.remarks, size: TransactionOverviewColumnWidths.remarks, meta: { label: PettyCashFundColumnLabels.remarks } }),
    columnHelper.accessor("createdBy", { header: PettyCashFundColumnLabels.createdBy, size: TransactionOverviewColumnWidths.auditUser, meta: { label: PettyCashFundColumnLabels.createdBy } }),
    columnHelper.accessor("createdAt", { header: PettyCashFundColumnLabels.createdAt, size: TransactionOverviewColumnWidths.auditDate, meta: { label: PettyCashFundColumnLabels.createdAt } }),
    columnHelper.accessor("updatedBy", { header: PettyCashFundColumnLabels.updatedBy, size: TransactionOverviewColumnWidths.auditUser, meta: { label: PettyCashFundColumnLabels.updatedBy } }),
    columnHelper.accessor("updatedAt", { header: PettyCashFundColumnLabels.updatedAt, size: TransactionOverviewColumnWidths.auditDate, meta: { label: PettyCashFundColumnLabels.updatedAt } }),
    columnHelper.accessor("status", { header: PettyCashFundColumnLabels.status, size: TransactionOverviewColumnWidths.status, meta: { className: "text-center", label: PettyCashFundColumnLabels.status } }),
    columnHelper.display({ id: "actions", header: PettyCashFundColumnLabels.actions, size: CashDisbursementOverviewActionColumnWidth, meta: { className: "text-center", label: PettyCashFundColumnLabels.actions } }),
  ], []);
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns its state handlers.
  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { columnVisibility: PettyCashFundDefaultColumnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnVisibility, pagination, sorting },
  });
  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => [
    {
      icon: ReceiptText,
      label: "Total Entries",
      value: records.length,
      summary: "All time",
      tone: "violet",
      onClick: () => setStatusFilter("All"),
      isActive: statusFilter === "All",
    },
    ...PettyCashFundRecordStatuses.map((status) => {
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
  ], [records, statusFilter]);

  function updateStatus(record: PettyCashFundRecord, status: PettyCashFundStatus) {
    const next = records.map((item) =>
      item.id === record.id
        ? { ...item, status, updatedAt: new Date().toISOString(), updatedBy: "Current User" }
        : item,
    );
    setRecords(next);
    savePettyCashFundRecords(next);
    setLastSyncedAt(Date.now());
    toast.success(`Petty cash fund marked as ${status}.`);
  }

  function refreshRecords() {
    setRecords(getPettyCashFundRecords());
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

function getMetricTone(status: PettyCashFundStatus) {
  if (status === "Posted") return "emerald" as const;
  if (status === "For Approval") return "amber" as const;
  if (status === "Disapproved") return "red" as const;
  if (status === "Cancelled") return "slate" as const;
  return "blue" as const;
}

export type PettyCashFundOverviewPageState = ReturnType<typeof usePettyCashFundOverviewPage>;
