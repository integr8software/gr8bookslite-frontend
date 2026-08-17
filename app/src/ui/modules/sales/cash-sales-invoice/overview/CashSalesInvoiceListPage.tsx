"use client";

import Link from "next/link";
import { Ban, CheckCircle2, Clock3, FileText, Plus, Search } from "lucide-react";
import {
  CashSalesInvoiceHref,
  CashSalesInvoiceStatusFilterOptions,
  CashSalesInvoiceTablePaginationStorageKey,
} from "@/app/src/constants/modules/sales/cash-sales-invoice/CashSalesInvoiceConstants";
import {
  countCashSalesInvoicesByStatus,
  formatCashSalesInvoiceDate,
  formatCashSalesInvoicePercentage,
} from "@/app/src/data/modules/sales/cash-sales-invoice/CashSalesInvoiceData";
import {
  useCashSalesInvoiceStore,
  useCashSalesInvoiceTable,
} from "@/app/src/hooks/modules/sales/cash-sales-invoice/useCashSalesInvoice";
import type {
  CashSalesInvoiceRecord,
  CashSalesInvoiceStatus,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";
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
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { CashSalesInvoiceRecordActions } from "@/app/src/ui/modules/sales/cash-sales-invoice/overview/CashSalesInvoiceRecordActions";

export function CashSalesInvoiceListPage() {
  const { invoices, lastSyncedAt, updateInvoiceStatus } = useCashSalesInvoiceStore();
  const tableState = useCashSalesInvoiceTable(invoices);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Cash Sales Invoice"
        description="Record immediate cash sales invoices with party, warehouse, account, and delivery references."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Sales
          </>
        }
        actions={
          <Link href={`${CashSalesInvoiceHref}/add`} className={moduleHeaderActionClassNames.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Cash Sales Invoice
          </Link>
        }
      />

      <CashSalesInvoiceMetrics records={invoices} />

      <ModuleTable
        emptyDescription="Try another CSI number, party, SJ no., or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No cash sales invoices matched"
        minWidthClassName="min-w-[88rem]"
        paginationLabel="entries"
        paginationStorageKey={CashSalesInvoiceTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        table={tableState.table}
        tableTitle="Cash sales invoice entries"
        toolbar={
          <ModuleTableToolbar className="xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(12rem,1fr)_auto]">
            <ModuleTableSearch
              label="Search cash sales invoices"
              value={tableState.query}
              onChange={tableState.setQuery}
              placeholder="Search by CSI no., party, or SJ no."
            />
            <DateRangePicker
              label="Date Range"
              value={tableState.dateRange}
              onChange={tableState.setDateRange}
            />
            <ModuleTableFilterSelect
              label="Status"
              value={tableState.statusFilter}
              options={CashSalesInvoiceStatusFilterOptions}
              onChange={(value) =>
                tableState.setStatusFilter(
                  value as Parameters<typeof tableState.setStatusFilter>[0],
                )
              }
            />
            <ModuleTableResetButton onClick={tableState.resetFilters} />
          </ModuleTableToolbar>
        }
        renderRow={({ id, original }) => (
          <tr key={id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
            <td className="px-4 py-4 font-semibold text-skyblue">{original.transactionNo}</td>
            <td className="px-4 py-4">{formatCashSalesInvoiceDate(original.documentDate)}</td>
            <td className="px-4 py-4">
              <div className="font-medium">{original.customerName}</div>
              <div className="text-xs text-darknavy/55">{original.customerCode}</div>
            </td>
            <td className="px-4 py-4">{original.sjNo || "-"}</td>
            <td className="px-4 py-4">
              <CashSalesInvoiceStatusBadge status={original.status} />
            </td>
            <td className="px-4 py-4 text-center">
              <CashSalesInvoiceRecordActions
                record={original}
                onUpdateStatus={updateInvoiceStatus}
              />
            </td>
          </tr>
        )}
      />
    </section>
  );
}

function CashSalesInvoiceMetrics({ records }: { records: CashSalesInvoiceRecord[] }) {
  const draftCount = countCashSalesInvoicesByStatus(records, "Draft");
  const postedCount = countCashSalesInvoicesByStatus(records, "Posted");
  const cancelledCount = countCashSalesInvoicesByStatus(records, "Cancelled");

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-4"
      items={[
        {
          label: "Total Invoices",
          value: records.length,
          summary: "All time",
          icon: FileText,
          iconClassName: "bg-skyblue/20 text-skyblue",
        },
        {
          label: "Draft",
          value: draftCount,
          summary: formatCashSalesInvoicePercentage(draftCount, records.length),
          icon: Clock3,
          iconClassName: "bg-offwhite text-darknavy",
        },
        {
          label: "Posted",
          value: postedCount,
          summary: formatCashSalesInvoicePercentage(postedCount, records.length),
          icon: CheckCircle2,
          iconClassName: "bg-citron/25 text-darknavy",
        },
        {
          label: "Cancelled",
          value: cancelledCount,
          summary: formatCashSalesInvoicePercentage(cancelledCount, records.length),
          icon: Ban,
          iconClassName: "bg-coralpink/15 text-coralpink",
        },
      ]}
    />
  );
}

function CashSalesInvoiceStatusBadge({ status }: { status: CashSalesInvoiceStatus }) {
  const Icon = status === "Posted" ? CheckCircle2 : status === "Cancelled" ? Ban : Clock3;

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
        status === "Posted"
          ? "bg-citron/25 text-darknavy"
          : status === "Cancelled"
            ? "bg-coralpink/15 text-coralpink"
            : "bg-offwhite text-darknavy/70",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}
