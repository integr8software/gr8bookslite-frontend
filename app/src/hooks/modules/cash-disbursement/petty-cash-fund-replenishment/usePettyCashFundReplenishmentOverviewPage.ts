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
  PettyCashFundReplenishmentColumnLabels,
  PettyCashFundReplenishmentDefaultColumnVisibility,
  PettyCashFundReplenishmentOverviewColumnWidths,
  PettyCashFundReplenishmentRecordStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import {
  getPettyCashFundReplenishmentRecords,
  savePettyCashFundReplenishmentRecords,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentService";
import type {
  PettyCashFundReplenishmentRecord,
  PettyCashFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import type { AmountRangeValue } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import type { DateRangeValue } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  getModuleStatusMetricIcon,
  getModuleStatusMetricIconClassName,
} from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type { ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";

const columnHelper = createColumnHelper<PettyCashFundReplenishmentRecord>();
const emptyDateRange: DateRangeValue = { from: "", to: "" };
const emptyAmountRange: AmountRangeValue = { from: "", to: "" };

export function usePettyCashFundReplenishmentOverviewPage() {
  const [records, setRecords] = useState(getPettyCashFundReplenishmentRecords);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRangeValue>(emptyDateRange);
  const [amountRange, setAmountRange] = useState<AmountRangeValue>(emptyAmountRange);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => PettyCashFundReplenishmentDefaultColumnVisibility,
  );
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
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
          record.remarks,
        ].join(" "),
      );
      return (
        (!needle || searchableText.includes(needle)) &&
        (statusFilter === "All" || record.status === statusFilter) &&
        (!dateRange.from || record.documentDate >= dateRange.from) &&
        (!dateRange.to || record.documentDate <= dateRange.to) &&
        (!amountRange.from || record.amount >= Number(amountRange.from)) &&
        (!amountRange.to || record.amount <= Number(amountRange.to))
      );
    });
  }, [amountRange, dateRange, query, records, statusFilter]);
  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionNo", { header: PettyCashFundReplenishmentColumnLabels.transactionNo, size: PettyCashFundReplenishmentOverviewColumnWidths.transactionNo, meta: { label: PettyCashFundReplenishmentColumnLabels.transactionNo } }),
      columnHelper.accessor("documentDate", { header: PettyCashFundReplenishmentColumnLabels.documentDate, size: PettyCashFundReplenishmentOverviewColumnWidths.documentDate, meta: { label: PettyCashFundReplenishmentColumnLabels.documentDate } }),
      columnHelper.accessor("partyCode", { header: PettyCashFundReplenishmentColumnLabels.partyCode, size: PettyCashFundReplenishmentOverviewColumnWidths.partyCode, meta: { label: PettyCashFundReplenishmentColumnLabels.partyCode } }),
      columnHelper.accessor("partyName", { header: PettyCashFundReplenishmentColumnLabels.partyName, size: PettyCashFundReplenishmentOverviewColumnWidths.partyName, meta: { label: PettyCashFundReplenishmentColumnLabels.partyName } }),
      columnHelper.accessor("accountCode", { header: PettyCashFundReplenishmentColumnLabels.accountCode, size: PettyCashFundReplenishmentOverviewColumnWidths.accountCode, meta: { label: PettyCashFundReplenishmentColumnLabels.accountCode } }),
      columnHelper.accessor("accountTitle", { header: PettyCashFundReplenishmentColumnLabels.accountTitle, size: PettyCashFundReplenishmentOverviewColumnWidths.accountTitle, meta: { label: PettyCashFundReplenishmentColumnLabels.accountTitle } }),
      columnHelper.accessor("amount", { header: PettyCashFundReplenishmentColumnLabels.amount, size: PettyCashFundReplenishmentOverviewColumnWidths.amount, meta: { label: PettyCashFundReplenishmentColumnLabels.amount } }),
      columnHelper.accessor("remarks", { header: PettyCashFundReplenishmentColumnLabels.remarks, size: PettyCashFundReplenishmentOverviewColumnWidths.remarks, meta: { label: PettyCashFundReplenishmentColumnLabels.remarks } }),
      columnHelper.accessor("createdBy", { header: PettyCashFundReplenishmentColumnLabels.createdBy, size: PettyCashFundReplenishmentOverviewColumnWidths.createdBy, meta: { label: PettyCashFundReplenishmentColumnLabels.createdBy } }),
      columnHelper.accessor("createdAt", { header: PettyCashFundReplenishmentColumnLabels.createdAt, size: PettyCashFundReplenishmentOverviewColumnWidths.createdAt, meta: { label: PettyCashFundReplenishmentColumnLabels.createdAt } }),
      columnHelper.accessor("updatedBy", { header: PettyCashFundReplenishmentColumnLabels.updatedBy, size: PettyCashFundReplenishmentOverviewColumnWidths.updatedBy, meta: { label: PettyCashFundReplenishmentColumnLabels.updatedBy } }),
      columnHelper.accessor("updatedAt", { header: PettyCashFundReplenishmentColumnLabels.updatedAt, size: PettyCashFundReplenishmentOverviewColumnWidths.updatedAt, meta: { label: PettyCashFundReplenishmentColumnLabels.updatedAt } }),
      columnHelper.accessor("status", { header: PettyCashFundReplenishmentColumnLabels.status, size: PettyCashFundReplenishmentOverviewColumnWidths.status, meta: { className: "text-center", label: PettyCashFundReplenishmentColumnLabels.status } }),
      columnHelper.display({ id: "actions", header: PettyCashFundReplenishmentColumnLabels.actions, size: PettyCashFundReplenishmentOverviewColumnWidths.actions, meta: { className: "text-center", label: PettyCashFundReplenishmentColumnLabels.actions } }),
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
    initialState: { columnVisibility: PettyCashFundReplenishmentDefaultColumnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnVisibility, pagination, sorting },
  });
  const statisticCards = useMemo<ModuleStatisticCardItem[]>(() => [
    { icon: ReceiptText, label: "Total Entries", value: records.length, summary: "All time", tone: "violet", onClick: () => setStatusFilter("All"), isActive: statusFilter === "All" },
    ...PettyCashFundReplenishmentRecordStatuses.map((status) => {
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

  function updateStatus(
    record: PettyCashFundReplenishmentRecord,
    status: PettyCashFundReplenishmentStatus,
  ) {
    const next = records.map((item) =>
      item.id === record.id
        ? { ...item, status, updatedAt: new Date().toISOString(), updatedBy: "Current User" }
        : item,
    );
    setRecords(next);
    savePettyCashFundReplenishmentRecords(next);
    setLastSyncedAt(Date.now());
    toast.success(`Petty cash fund replenishment marked as ${status}.`);
  }

  function refreshRecords() {
    setRecords(getPettyCashFundReplenishmentRecords());
    setLastSyncedAt(Date.now());
  }

  return { amountRange, dateRange, isLoading: false, lastSyncedAt, query, refreshRecords, setAmountRange, setDateRange, setQuery, setStatusFilter, statisticCards, statusFilter, table, updateStatus };
}

function getMetricTone(status: PettyCashFundReplenishmentStatus) {
  if (status === "Posted") return "emerald" as const;
  if (status === "For Approval") return "amber" as const;
  if (status === "Disapproved") return "red" as const;
  if (status === "Cancelled") return "slate" as const;
  return "blue" as const;
}

export type PettyCashFundReplenishmentOverviewPageState = ReturnType<
  typeof usePettyCashFundReplenishmentOverviewPage
>;
