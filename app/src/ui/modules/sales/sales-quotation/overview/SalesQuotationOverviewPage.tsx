"use client";

import { ClipboardList, Search } from "lucide-react";
import {
  SalesQuotationStatusFilterOptions,
  SalesQuotationTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { useSalesQuotationOverviewPage } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotationOverviewPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { SalesQuotationListHeaderActions } from "@/app/src/ui/modules/sales/sales-quotation/overview/SalesQuotationListHeaderActions";
import { SalesQuotationTableRow } from "@/app/src/ui/modules/sales/sales-quotation/overview/SalesQuotationTableRow";
import { SalesQuotationMetrics } from "@/app/src/ui/modules/sales/sales-quotation/overview/SalesQuotationMetrics";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";

export function SalesQuotationOverviewPage() {
  const {
    amountRange,
    dateRange,
    handleConfirmDelete,
    handleQueryChange,
    isMutating,
    lastSyncedAt,
    pendingDeleteRequest,
    query,
    requests,
    resetFilters,
    setAmountRange,
    setDateRange,
    setPendingDeleteRequest,
    setStatusFilter,
    statusFilter,
    table,
  } = useSalesQuotationOverviewPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Sales Quotation"
        description="Prepare sales quotations, review party details, and preview the printable quotation before approval."
        eyebrow={
          <>
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
            Sales document
          </>
        }
        actions={<SalesQuotationListHeaderActions />}
      />

      <SalesQuotationMetrics records={requests} />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another quotation no., party, project, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No sales quotations found"
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[74rem]"
          paginationStorageKey={SalesQuotationTablePaginationStorageKey}
          table={table}
          tableTitle="Sales quotations"
          toolbar={
            <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
              <ModuleTableSearch
                label="Search sales quotations"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search by quotation no., party, project, or status"
              />
              <DateRangePicker label="Date Range" value={dateRange} onChange={setDateRange} />
              <AmountRangePicker label="Amount" value={amountRange} onChange={setAmountRange} />
              <ModuleTableFilterSelect
                label="Status"
                value={statusFilter}
                options={SalesQuotationStatusFilterOptions}
                onChange={(value) => setStatusFilter(value as typeof statusFilter)}
              />
              <ModuleTableResetButton onClick={resetFilters} />
            </ModuleTableToolbar>
          }
          renderRow={({ id, original }) => <SalesQuotationTableRow key={id} request={original} onDeleteRequest={setPendingDeleteRequest} />}
        />
      </div>

      <AppDialog
        isOpen={Boolean(pendingDeleteRequest)}
        isPending={isMutating}
        title="Delete sales quotation?"
        description={`This will remove quotation ${pendingDeleteRequest?.transNo ?? "the selected quotation"}.`}
        confirmLabel="Delete Quotation"
        tone="danger"
        onCancel={() => setPendingDeleteRequest(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
