"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, FileText, PackageCheck, Plus, Search, XCircle } from "lucide-react";
import {
  JournalVoucherHref,
  JournalVoucherStatusFilters,
  JournalVoucherStatusFilterOptions,
  JournalVoucherTablePaginationStorageKey,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import { useJournalVoucherListPage } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucherListPage";
import type { JournalVoucherStatistics } from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import { JournalVoucherTableRow } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherTableRow";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type JournalVoucherStatusFilter = (typeof JournalVoucherStatusFilters)[number];

export function JournalVoucherListPage() {
  const {
    amountRange,
    dateRange,
    handleQueryChange,
    handleUpdateStatus,
    isLoading,
    isRefreshing,
    lastSyncedAt,
    permissions,
    query,
    refreshRecords,
    setAmountRange,
    setDateRange,
    setStatusFilter,
    statusFilter,
    statistics,
    table,
  } = useJournalVoucherListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Journal Voucher"
        description="Record manual journal vouchers with balanced debit and credit entries."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            General journal
          </>
        }
        actions={
          <Link
            href={`${JournalVoucherHref}/add`}
            aria-disabled={!permissions.canCreate}
            className={moduleHeaderActionClassNames.primary}
            onClick={(event) => {
              if (!permissions.canCreate) {
                event.preventDefault();
              }
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create New Journal Voucher
          </Link>
        }
      />

      <JournalVoucherMetrics
        isLoading={isLoading}
        statistics={statistics}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another voucher no., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No journal vouchers found"
          isLoading={isLoading}
          isSyncing={isRefreshing}
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[82rem]"
          paginationStorageKey={JournalVoucherTablePaginationStorageKey}
          table={table}
          tableTitle="Journal vouchers"
          toolbar={
            <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 xl:!grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
                <ModuleTableSearch
                  label="Search journal vouchers"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search by voucher no. or remarks"
                />
                <DateRangePicker label="Date Range" value={dateRange} onChange={setDateRange} />
                <AmountRangePicker label="Amount Range" value={amountRange} onChange={setAmountRange} />
                <ModuleTableFilterSelect
                  label="Status"
                  value={statusFilter}
                  options={JournalVoucherStatusFilterOptions}
                  onChange={(value) => setStatusFilter(value as (typeof JournalVoucherStatusFilters)[number])}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 xl:w-[7rem]">
                <ModuleTableColumnVisibilityButton table={table} />
                <ModuleTableResetButton className="px-2" isRefreshing={isRefreshing} onClick={refreshRecords}>
                  <span className="sr-only">Refresh</span>
                </ModuleTableResetButton>
              </div>
            </ModuleTableToolbar>
          }
          renderRow={(row) => (
            <JournalVoucherTableRow key={row.id} row={row} permissions={permissions} onUpdateStatus={handleUpdateStatus} />
          )}
        />
      </div>
    </section>
  );
}

function JournalVoucherMetrics({
  isLoading,
  onStatusFilterChange,
  statistics,
  statusFilter,
}: {
  isLoading: boolean;
  onStatusFilterChange: (status: JournalVoucherStatusFilter) => void;
  statistics: JournalVoucherStatistics;
  statusFilter: JournalVoucherStatusFilter;
}) {
  const totalCount = statistics.totalVouchers;
  const cards = [
    {
      label: "Total Transaction",
      value: totalCount,
      summary: "All time",
      icon: FileText,
      iconClassName: "bg-skyblue/20 text-skyblue",
      isActive: statusFilter === "all",
      onClick: () => onStatusFilterChange("all"),
    },
    {
      label: "Posted",
      value: statistics.postedVouchers,
      summary: formatPercentage(statistics.postedVouchers, totalCount),
      icon: PackageCheck,
      iconClassName: "bg-skyblue/20 text-darknavy",
      isActive: statusFilter === "Posted",
      onClick: () => onStatusFilterChange("Posted"),
    },
    {
      label: "Draft",
      value: statistics.draftVouchers,
      summary: formatPercentage(statistics.draftVouchers, totalCount),
      icon: Clock3,
      iconClassName: "bg-offwhite text-darknavy",
      isActive: statusFilter === "Draft",
      onClick: () => onStatusFilterChange("Draft"),
    },
    {
      label: "For Approval",
      value: statistics.forApprovalVouchers,
      summary: formatPercentage(statistics.forApprovalVouchers, totalCount),
      icon: CheckCircle2,
      iconClassName: "bg-emerald-50 text-emerald-700",
      isActive: statusFilter === "For Approval",
      onClick: () => onStatusFilterChange("For Approval"),
    },
    {
      label: "Disapproved",
      value: statistics.disapprovedVouchers,
      summary: formatPercentage(statistics.disapprovedVouchers, totalCount),
      icon: XCircle,
      iconClassName: "bg-coralpink/15 text-coralpink",
      isActive: statusFilter === "Disapproved",
      onClick: () => onStatusFilterChange("Disapproved"),
    },
    {
      label: "Cancelled",
      value: statistics.cancelledVouchers,
      summary: formatPercentage(statistics.cancelledVouchers, totalCount),
      icon: XCircle,
      iconClassName: "bg-slate-100 text-slate-700",
      isActive: statusFilter === "Cancelled",
      onClick: () => onStatusFilterChange("Cancelled"),
    },
  ];

  return <ModuleStatisticCards items={cards} isLoading={isLoading} className="2xl:grid-cols-6" />;
}

function formatPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}
