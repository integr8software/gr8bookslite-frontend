"use client";

import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import {
  CreditMemoHref,
  CreditMemoStatusFilterOptions,
  CreditMemoTablePaginationStorageKey,
} from "@/app/src/constants/modules/general-journal/credit-memo/CreditMemoConstants";
import { useCreditMemoListPage } from "@/app/src/hooks/modules/general-journal/credit-memo/useCreditMemoListPage";
import type { CreditMemoStatusFilter } from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";
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
import { CreditMemoStatisticCards } from "@/app/src/ui/modules/general-journal/credit-memo/CreditMemoStatisticCards";
import { CreditMemoTableRow } from "@/app/src/ui/modules/general-journal/credit-memo/CreditMemoTableRow";

export function CreditMemoListPage() {
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
  } = useCreditMemoListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Credit Memo"
        description="Record credit memo accounting entries and customer adjustments."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            General journal
          </>
        }
        actions={
          <Link href={`${CreditMemoHref}/add`} className={moduleHeaderActionClassNames.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create New Credit Memo
          </Link>
        }
      />

      <CreditMemoStatisticCards
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
          emptyTitle="No credit memos found"
          isLoading={isLoading}
          isSyncing={isRefreshing}
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[88rem]"
          paginationStorageKey={CreditMemoTablePaginationStorageKey}
          table={table}
          tableTitle="Credit memos"
          toolbar={
            <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 xl:!grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
                <ModuleTableSearch
                  label="Search credit memos"
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
                  options={CreditMemoStatusFilterOptions}
                  onChange={(value) => setStatusFilter(value as CreditMemoStatusFilter)}
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
            <CreditMemoTableRow
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
