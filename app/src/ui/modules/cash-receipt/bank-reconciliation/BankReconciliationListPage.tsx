"use client";

import Link from "next/link";
import { Landmark, Plus, Search } from "lucide-react";
import {
  BankReconciliationHref,
  BankReconciliationStatusFilterOptions,
  BankReconciliationTablePaginationStorageKey,
} from "@/app/src/constants/modules/cash-receipt/bank-reconciliation/BankReconciliationConstants";
import { useBankReconciliationListPage } from "@/app/src/hooks/modules/cash-receipt/bank-reconciliation/useBankReconciliationListPage";
import type { BankReconciliationStatusFilter } from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";
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
import { BankReconciliationStatisticCards } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/BankReconciliationStatisticCards";
import { BankReconciliationTableRow } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/BankReconciliationTableRow";

export function BankReconciliationListPage() {
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
  } = useBankReconciliationListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Bank Reconciliation"
        description="Match bank statement ending balances and clear outstanding checks and deposits."
        eyebrow={
          <>
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            Cash receipt
          </>
        }
        actions={
          <Link
            href={`${BankReconciliationHref}/add`}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Bank Reconciliation
          </Link>
        }
      />

      <BankReconciliationStatisticCards
        isLoading={isLoading}
        statistics={statistics}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another BR No., bank name, account code, date range, or status filter."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No bank reconciliations found"
          isLoading={isLoading}
          isSyncing={isRefreshing}
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[80rem]"
          paginationStorageKey={BankReconciliationTablePaginationStorageKey}
          table={table}
          tableTitle="Bank reconciliations"
          toolbar={
            <ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 xl:!grid-cols-[minmax(0,1fr)_auto]">
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
                <ModuleTableSearch
                  label="Search reconciliations"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search by BR No., bank, account code..."
                />
                <DateRangePicker
                  label="BR Date Range"
                  value={dateRange}
                  onChange={setDateRange}
                />
                <AmountRangePicker
                  label="Bank Balance Range"
                  value={amountRange}
                  onChange={setAmountRange}
                />
                <ModuleTableFilterSelect
                  label="Status"
                  value={statusFilter}
                  options={BankReconciliationStatusFilterOptions}
                  onChange={(value) =>
                    setStatusFilter(value as BankReconciliationStatusFilter)
                  }
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
            <BankReconciliationTableRow
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
