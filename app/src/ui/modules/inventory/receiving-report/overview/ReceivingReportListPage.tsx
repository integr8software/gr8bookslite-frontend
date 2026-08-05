"use client";

import { Boxes, Search } from "lucide-react";
import { useReceivingReportListPage } from "@/app/src/hooks/modules/inventory/receiving-report/useReceivingReportListPage";
import {
  ReceivingReportStatusFilterOptions,
  ReceivingReportTablePaginationStorageKey,
} from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ReceivingReportListHeaderActions } from "@/app/src/ui/modules/inventory/receiving-report/overview/ReceivingReportListHeaderActions";
import { ReceivingReportMetrics } from "@/app/src/ui/modules/inventory/receiving-report/overview/ReceivingReportMetrics";
import { ReceivingReportTableRow } from "@/app/src/ui/modules/inventory/receiving-report/overview/ReceivingReportTableRow";

export function ReceivingReportListPage() {
  const page = useReceivingReportListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Receiving Report"
        description="Search receiving reports, review warehouse receipts, and create or update received item entries."
        eyebrow={
          <>
            <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
            Inventory
          </>
        }
        actions={<ReceivingReportListHeaderActions />}
      />

      <ReceivingReportMetrics records={page.records} />

      <ModuleTable
        emptyDescription="Try a different RR no., vendor, Party Code, PO no., status, date, or amount range."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No receiving reports matched"
        minWidthClassName="min-w-[92rem]"
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        paginationLabel="entries"
        paginationStorageKey={ReceivingReportTablePaginationStorageKey}
        table={page.table}
        tableTitle="Receiving report entries"
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
            <ModuleTableSearch
              label="Search Receiving Reports"
              value={page.query}
              onChange={page.setQuery}
              placeholder="Search by RR no., vendor, Party Code, or PO no."
            />
            <DateRangePicker
              label="Date Range"
              value={page.dateRange}
              onChange={page.setDateRange}
            />
            <AmountRangePicker
              label="Amount"
              value={page.amountRange}
              onChange={page.setAmountRange}
            />
            <ModuleTableFilterSelect
              label="Status"
              value={page.statusFilter}
              options={ReceivingReportStatusFilterOptions}
              onChange={page.setStatusFilter}
            />
            <ModuleTableResetButton onClick={page.resetFilters} />
          </ModuleTableToolbar>
        }
        renderRow={({ id, original }) => (
          <ReceivingReportTableRow
            key={id}
            id={id}
            record={original}
            onUpdateStatus={page.updateReceivingReportStatus}
          />
        )}
      />
    </section>
  );
}
