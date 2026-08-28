"use client";

import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import {
  DebitMemoHref,
  DebitMemoStatusFilterOptions,
  DebitMemoTablePaginationStorageKey,
} from "@/app/src/constants/modules/general-journal/debit-memo/DebitMemoConstants";
import { useDebitMemoListPage } from "@/app/src/hooks/modules/general-journal/debit-memo/useDebitMemoListPage";
import type { DebitMemoStatusFilter } from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { DebitMemoStatisticCards } from "@/app/src/ui/modules/general-journal/debit-memo/DebitMemoStatisticCards";
import { DebitMemoTableRow } from "@/app/src/ui/modules/general-journal/debit-memo/DebitMemoTableRow";

export function DebitMemoListPage() {
  const {
    amountRange,
    dateRange,
    handleQueryChange,
    handleUpdateStatus,
    isLoading,
    isRefreshing,
    lastSyncedAt,
    query,
    refreshRecords,
    setAmountRange,
    setDateRange,
    setStatusFilter,
    statusFilter,
    statistics,
    table,
  } = useDebitMemoListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Debit Memo"
        description="Record debit memo accounting entries and customer adjustments."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            General journal
          </>
        }
        actions={
          <Link href={`${DebitMemoHref}/add`} className={moduleHeaderActionClassNames.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create New Debit Memo
          </Link>
        }
      />

      <DebitMemoStatisticCards
        isLoading={isLoading}
        statistics={statistics}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another memo no., party, reference, remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No debit memos found"
          isLoading={isLoading}
          isSyncing={isRefreshing}
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[88rem]"
          paginationStorageKey={DebitMemoTablePaginationStorageKey}
          table={table}
          tableTitle="Debit memos"
          toolbar={
            <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 xl:!grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
                <ModuleTableSearch
                  label="Search debit memos"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search by memo no., party, reference, or remarks"
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
                  options={DebitMemoStatusFilterOptions}
                  onChange={(value) => setStatusFilter(value as DebitMemoStatusFilter)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 xl:w-[7rem]">
                <ModuleTableColumnVisibilityButton table={table} />
                <ModuleTableResetButton
                  className="px-2"
                  isRefreshing={isRefreshing}
                  onClick={refreshRecords}
                >
                  <span className="sr-only">Refresh</span>
                </ModuleTableResetButton>
              </div>
            </ModuleTableToolbar>
          }
          renderRow={(row) => (
            <DebitMemoTableRow
              key={row.id}
              row={row}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        />
      </div>
    </section>
  );
}
