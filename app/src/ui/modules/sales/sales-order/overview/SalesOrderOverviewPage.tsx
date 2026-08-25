"use client";

import Link from "next/link";
import { FilePlus2, FileText, Search } from "lucide-react";
import {
  SalesOrderHref,
  SalesOrderStatusFilterOptions,
  SalesOrderTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/sales-order/SalesOrderConstants";
import { getSalesQuotationTotal } from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import { useSalesOrderOverviewPage } from "@/app/src/hooks/modules/sales/sales-order/useSalesOrderOverviewPage";
import type { SalesOrderRecord } from "@/app/src/types/modules/sales/sales-order/SalesOrderTypes";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { SalesOrderMetrics } from "@/app/src/ui/modules/sales/sales-order/overview/SalesOrderMetrics";
import { SalesOrderRecordActions } from "@/app/src/ui/modules/sales/sales-order/overview/SalesOrderRecordActions";

export function SalesOrderOverviewPage() {
  const tableState = useSalesOrderOverviewPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Sales Order"
        description="Create sales orders, review customer order details, and track order status."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Sales
          </>
        }
        actions={
          <Link href={`${SalesOrderHref}/add`} className={moduleHeaderActionClassNames.primary}>
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            New Sales Order
          </Link>
        }
      />

      <SalesOrderMetrics records={tableState.orders} />

      <ModuleTable
        emptyDescription="Try a different order number, customer, sales quotation reference, amount, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No sales orders matched"
        minWidthClassName="min-w-[82rem]"
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        paginationLabel="entries"
        paginationStorageKey={SalesOrderTablePaginationStorageKey}
        table={tableState.table}
        tableTitle="Sales order transactions"
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
            <ModuleTableSearch
              label="Search Sales Orders"
              value={tableState.query}
              onChange={tableState.setQuery}
              placeholder="Search by SO no., customer, or SQ reference"
            />
            <DateRangePicker label="Date Range" value={tableState.dateRange} onChange={tableState.setDateRange} />
            <AmountRangePicker label="Amount" value={tableState.amountRange} onChange={tableState.setAmountRange} />
            <ModuleTableFilterSelect
              label="Status"
              value={tableState.statusFilter}
              options={SalesOrderStatusFilterOptions}
              onChange={(value) => tableState.setStatusFilter(value as typeof tableState.statusFilter)}
            />
            <ModuleTableResetButton onClick={tableState.resetFilters} />
          </ModuleTableToolbar>
        }
        renderRow={({ id, original }) => <SalesOrderTableRow key={id} record={original} />}
      />
    </section>
  );
}

function SalesOrderTableRow({ record }: { record: SalesOrderRecord }) {
  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      <td className="px-4 py-4 font-semibold text-skyblue">{record.transNo}</td>
      <td className="px-4 py-4">{record.prDate}</td>
      <td className="px-4 py-4">{record.partyName}</td>
      <td className="px-4 py-4">{record.referenceNo || "-"}</td>
      <td className="px-4 py-4 font-semibold text-darknavy">
        {getSalesQuotationTotal(record).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex rounded-md bg-skyblue/15 px-2.5 py-1 text-xs font-semibold text-darknavy">{record.status}</span>
      </td>
      <td className="px-4 py-4 text-center">
        <SalesOrderRecordActions record={record} />
      </td>
    </tr>
  );
}
