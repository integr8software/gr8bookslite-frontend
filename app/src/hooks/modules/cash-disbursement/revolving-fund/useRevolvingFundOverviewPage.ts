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
  RevolvingFundColumnLabels,
  RevolvingFundDefaultColumnVisibility,
  RevolvingFundRecordStatuses,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import {
  getRevolvingFundRecords,
  saveRevolvingFundRecords,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundService";
import type {
  RevolvingFundRecord,
  RevolvingFundStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
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

const columnHelper = createColumnHelper<RevolvingFundRecord>();
const emptyDateRange: DateRangeValue = { from: "", to: "" };
const emptyAmountRange: AmountRangeValue = { from: "", to: "" };

export function useRevolvingFundOverviewPage() {
  const [records, setRecords] = useState(getRevolvingFundRecords);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>(emptyDateRange);
  const [amountRange, setAmountRange] = useState<AmountRangeValue>(emptyAmountRange);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => RevolvingFundDefaultColumnVisibility,
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
    columnHelper.accessor("transactionNo", { header: RevolvingFundColumnLabels.transactionNo, size: TransactionOverviewColumnWidths.transactionNumber, meta: { label: RevolvingFundColumnLabels.transactionNo } }),
    columnHelper.accessor("documentDate", { header: RevolvingFundColumnLabels.documentDate, size: TransactionOverviewColumnWidths.documentDate, meta: { label: RevolvingFundColumnLabels.documentDate } }),
    columnHelper.accessor("partyCode", { header: RevolvingFundColumnLabels.partyCode, size: TransactionOverviewColumnWidths.partyCode, meta: { label: RevolvingFundColumnLabels.partyCode } }),
    columnHelper.accessor("partyName", { header: RevolvingFundColumnLabels.partyName, size: TransactionOverviewColumnWidths.partyName, meta: { label: RevolvingFundColumnLabels.partyName } }),
    columnHelper.accessor("accountCode", { header: RevolvingFundColumnLabels.accountCode, size: TransactionOverviewColumnWidths.accountCode, meta: { label: RevolvingFundColumnLabels.accountCode } }),
    columnHelper.accessor("accountTitle", { header: RevolvingFundColumnLabels.accountTitle, size: TransactionOverviewColumnWidths.accountTitle, meta: { label: RevolvingFundColumnLabels.accountTitle } }),
    columnHelper.accessor("amount", { header: RevolvingFundColumnLabels.amount, size: TransactionOverviewColumnWidths.amount, meta: { label: RevolvingFundColumnLabels.amount } }),
    columnHelper.accessor("remarks", { header: RevolvingFundColumnLabels.remarks, size: TransactionOverviewColumnWidths.remarks, meta: { label: RevolvingFundColumnLabels.remarks } }),
    columnHelper.accessor("createdBy", { header: RevolvingFundColumnLabels.createdBy, size: TransactionOverviewColumnWidths.auditUser, meta: { label: RevolvingFundColumnLabels.createdBy } }),
    columnHelper.accessor("createdAt", { header: RevolvingFundColumnLabels.createdAt, size: TransactionOverviewColumnWidths.auditDate, meta: { label: RevolvingFundColumnLabels.createdAt } }),
    columnHelper.accessor("updatedBy", { header: RevolvingFundColumnLabels.updatedBy, size: TransactionOverviewColumnWidths.auditUser, meta: { label: RevolvingFundColumnLabels.updatedBy } }),
    columnHelper.accessor("updatedAt", { header: RevolvingFundColumnLabels.updatedAt, size: TransactionOverviewColumnWidths.auditDate, meta: { label: RevolvingFundColumnLabels.updatedAt } }),
    columnHelper.accessor("status", { header: RevolvingFundColumnLabels.status, size: TransactionOverviewColumnWidths.status, meta: { className: "text-center", label: RevolvingFundColumnLabels.status } }),
    columnHelper.display({ id: "actions", header: RevolvingFundColumnLabels.actions, size: CashDisbursementOverviewActionColumnWidth, meta: { className: "text-center", label: RevolvingFundColumnLabels.actions } }),
  ], []);
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns its state handlers.
  const table = useReactTable({
    columns,
    data: filteredRecords,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { columnVisibility: RevolvingFundDefaultColumnVisibility },
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
    ...RevolvingFundRecordStatuses.map((status) => {
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

  function updateStatus(record: RevolvingFundRecord, status: RevolvingFundStatus) {
    const next = records.map((item) =>
      item.id === record.id
        ? { ...item, status, updatedAt: new Date().toISOString(), updatedBy: "Current User" }
        : item,
    );
    setRecords(next);
    saveRevolvingFundRecords(next);
    setLastSyncedAt(Date.now());
    toast.success(`Revolving fund marked as ${status}.`);
  }

  function refreshRecords() {
    setRecords(getRevolvingFundRecords());
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

function getMetricTone(status: RevolvingFundStatus) {
  if (status === "Posted") return "emerald" as const;
  if (status === "For Approval") return "amber" as const;
  if (status === "Disapproved") return "red" as const;
  if (status === "Cancelled") return "slate" as const;
  return "blue" as const;
}

export type RevolvingFundOverviewPageState = ReturnType<typeof useRevolvingFundOverviewPage>;
