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
  JournalVoucherHref,
  JournalVoucherStatusFilters,
  JournalVoucherStatusFilterOptions,
  JournalVoucherTablePaginationStorageKey,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import { useJournalVoucherListPage } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucherListPage";
import type { JournalVoucherRecord } from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import { JournalVoucherTableRow } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherTableRow";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
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

type JournalVoucherStatusFilter = (typeof JournalVoucherStatusFilters)[number];

export function JournalVoucherListPage() {
  const {
    amountRange,
    dateRange,
    handleConfirmDelete,
    handleQueryChange,
    isLoading,
    isMutating,
    lastSyncedAt,
    pendingDeleteRecord,
    query,
    records,
    resetFilters,
    setAmountRange,
    setDateRange,
    setPendingDeleteRecord,
    setStatusFilter,
    statusFilter,
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
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create New Journal Voucher
          </Link>
        }
      />

      <JournalVoucherMetrics
        records={records}
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
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[76rem]"
          paginationStorageKey={JournalVoucherTablePaginationStorageKey}
          table={table}
          tableTitle="Journal vouchers"
          toolbar={
            <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
              <ModuleTableSearch
                label="Search journal vouchers"
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
                options={JournalVoucherStatusFilterOptions}
                onChange={(value) =>
                  setStatusFilter(value as (typeof JournalVoucherStatusFilters)[number])
                }
              />
              <ModuleTableResetButton onClick={resetFilters} />
            </ModuleTableToolbar>
          }
          renderRow={({ id, original }) => (
            <JournalVoucherTableRow
              key={id}
              record={original}
              onDeleteRecord={setPendingDeleteRecord}
            />
          )}
        />
      </div>

      <AppDialog
        isOpen={Boolean(pendingDeleteRecord)}
        isPending={isMutating}
        title="Delete journal voucher?"
        description={`This will remove ${pendingDeleteRecord?.transactionNo ?? "the selected journal voucher"}.`}
        confirmLabel="Delete Journal Voucher"
        tone="danger"
        onCancel={() => setPendingDeleteRecord(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}

function JournalVoucherMetrics({
  onStatusFilterChange,
  records,
  statusFilter,
}: {
  onStatusFilterChange: (status: JournalVoucherStatusFilter) => void;
  records: JournalVoucherRecord[];
  statusFilter: JournalVoucherStatusFilter;
}) {
  const draftCount = countRecordsByStatus(records, "Draft");
  const approvedCount = countRecordsByStatus(records, "Approved");
  const disapprovedCount = countRecordsByStatus(records, "Disapproved");
  const postedCount = countRecordsByStatus(records, "Posted");
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
      label: "Posted",
      value: postedCount,
      summary: formatPercentage(postedCount, records.length),
      icon: PackageCheck,
      iconClassName: "bg-citron/25 text-darknavy",
      isActive: statusFilter === "Posted",
      onClick: () => onStatusFilterChange("Posted"),
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
  records: JournalVoucherRecord[],
  status: JournalVoucherRecord["status"],
) {
  return records.filter((record) => record.status === status).length;
}

function formatPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}
