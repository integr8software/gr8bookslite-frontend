"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  FileText,
  PackageCheck,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import {
  AccountsPayableVoucherHref,
  AccountsPayableVoucherStatusFilterOptions,
  AccountsPayableVoucherStatusFilters,
  AccountsPayableVoucherTablePaginationStorageKey,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { useAccountsPayableVoucherListPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherListPage";
import type { AccountsPayableVoucherRecord } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import { AccountsPayableVoucherTableRow } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTableRow";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type AccountsPayableVoucherStatusFilter =
  (typeof AccountsPayableVoucherStatusFilters)[number];

export function AccountsPayableVoucherListPage() {
  const {
    amountRange,
    dateRange,
    handleQueryChange,
    handleUpdateStatus,
    isLoading,
    lastSyncedAt,
    query,
    records,
    resetFilters,
    setAmountRange,
    setDateRange,
    setStatusFilter,
    statusFilter,
    table,
  } = useAccountsPayableVoucherListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Accounts Payable Voucher"
        description="Record supplier payable vouchers with expense and accounting entries."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Accounts payable
          </>
        }
        actions={
          <Link
            href={`${AccountsPayableVoucherHref}/add`}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create New Accounts Payable Voucher
          </Link>
        }
      />

      <AccountsPayableVoucherMetrics
        records={records}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another voucher no., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No accounts payable vouchers found"
          isLoading={isLoading}
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[82rem]"
          paginationStorageKey={AccountsPayableVoucherTablePaginationStorageKey}
          table={table}
          tableTitle="Accounts payable vouchers"
          toolbar={
            <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
              <ModuleTableSearch
                label="Search accounts payable vouchers"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search by voucher no. or remarks"
              />
              <DateRangePicker
                label="Date Range"
                value={dateRange}
                onChange={setDateRange}
              />
              <AmountRangePicker
                label="Amount Range"
                value={amountRange}
                onChange={setAmountRange}
              />
              <ModuleTableFilterSelect
                label="Status"
                value={statusFilter}
                options={AccountsPayableVoucherStatusFilterOptions}
                onChange={(value) =>
                  setStatusFilter(
                    value as (typeof AccountsPayableVoucherStatusFilters)[number],
                  )
                }
              />
              <ModuleTableResetButton onClick={resetFilters} />
            </ModuleTableToolbar>
          }
          renderRow={({ id, original }) => (
            <AccountsPayableVoucherTableRow
              key={id}
              record={original}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        />
      </div>
    </section>
  );
}

function AccountsPayableVoucherMetrics({
  onStatusFilterChange,
  records,
  statusFilter,
}: {
  onStatusFilterChange: (status: AccountsPayableVoucherStatusFilter) => void;
  records: AccountsPayableVoucherRecord[];
  statusFilter: AccountsPayableVoucherStatusFilter;
}) {
  const draftCount = countRecordsByStatus(records, "Draft");
  const approvedCount = countRecordsByStatus(records, "Approved");
  const disapprovedCount = countRecordsByStatus(records, "Disapproved");
  const closedCount = countRecordsByStatus(records, "Closed");
  const cancelledCount = countRecordsByStatus(records, "Cancelled");
  const cards = [
    {
      label: "Total Vouchers",
      value: records.length,
      summary: "All time",
      icon: FileText,
      iconClassName: "bg-skyblue/20 text-skyblue",
      isActive: statusFilter === "all",
      onClick: () => onStatusFilterChange("all"),
    },
    {
      label: "Draft",
      value: draftCount,
      summary: formatPercentage(draftCount, records.length),
      icon: Clock3,
      iconClassName: "bg-offwhite text-darknavy",
      isActive: statusFilter === "Draft",
      onClick: () => onStatusFilterChange("Draft"),
    },
    {
      label: "Approved",
      value: approvedCount,
      summary: formatPercentage(approvedCount, records.length),
      icon: CheckCircle2,
      iconClassName: "bg-emerald-50 text-emerald-700",
      isActive: statusFilter === "Approved",
      onClick: () => onStatusFilterChange("Approved"),
    },
    {
      label: "Disapproved",
      value: disapprovedCount,
      summary: formatPercentage(disapprovedCount, records.length),
      icon: XCircle,
      iconClassName: "bg-coralpink/15 text-coralpink",
      isActive: statusFilter === "Disapproved",
      onClick: () => onStatusFilterChange("Disapproved"),
    },
    {
      label: "Closed",
      value: closedCount,
      summary: formatPercentage(closedCount, records.length),
      icon: PackageCheck,
      iconClassName: "bg-skyblue/20 text-darknavy",
      isActive: statusFilter === "Closed",
      onClick: () => onStatusFilterChange("Closed"),
    },
    {
      label: "Cancelled",
      value: cancelledCount,
      summary: formatPercentage(cancelledCount, records.length),
      icon: XCircle,
      iconClassName: "bg-slate-100 text-slate-700",
      isActive: statusFilter === "Cancelled",
      onClick: () => onStatusFilterChange("Cancelled"),
    },
  ];

  return <ModuleStatisticCards items={cards} className="2xl:grid-cols-6" />;
}

function countRecordsByStatus(
  records: AccountsPayableVoucherRecord[],
  status: AccountsPayableVoucherRecord["status"],
) {
  return records.filter((record) => record.status === status).length;
}

function formatPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}
