"use client";

import Link from "next/link";
import { flexRender } from "@tanstack/react-table";
import { Landmark, Plus, Search } from "lucide-react";
import {
  AdvancesToSuppliersHref,
  AdvancesToSuppliersPaginationStorageKey,
  AdvancesToSuppliersStatusOptions,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import type { AdvancesToSuppliersOverviewPageState } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersOverviewPage";
import { useAdvancesToSuppliersOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersOverviewPage";
import type { AdvancesToSuppliersRecord } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { AdvancesToSuppliersRecordActions } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/overview/AdvancesToSuppliersRecordActions";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { getColumnMetaClassName, joinClasses, moduleAccentClassNames } from "@/app/src/ui/shared/module/module-table/utils";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function AdvancesToSuppliersOverviewPage() {
  const page = useAdvancesToSuppliersOverviewPage();
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        title="Advances to Suppliers"
        titleAs="h1"
        description="Manage supplier advances, purchase-order references, and approval status."
        eyebrow={
          <>
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            data-spotlight-id="maintenance-create-record"
            href={`${AdvancesToSuppliersHref}/add`}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Advances to Suppliers
          </Link>
        }
      />
      <ModuleStatisticCards className="2xl:grid-cols-6" isLoading={page.isLoading} items={page.statisticCards} />
      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Adjust the filters or start a new supplier advance."
          emptyTitle="No Advances to Suppliers Found"
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          isLoading={page.isLoading}
          lastSyncedAt={page.lastSyncedAt}
          paginationLabel="records"
          paginationStorageKey={AdvancesToSuppliersPaginationStorageKey}
          table={page.table}
          tableTitle="Advances to Suppliers Transactions"
          toolbar={<AdvancesToSuppliersToolbar page={page} />}
          useColumnSizing
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 text-darknavy last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={joinClasses(
                    "px-4 py-4 align-middle text-sm text-darknavy",
                    getColumnMetaClassName(cell.column.columnDef.meta),
                  )}
                >
                  {renderCell(cell.column.id, row.original, page) ?? flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          )}
        />
      </div>
    </section>
  );
}

function AdvancesToSuppliersToolbar({ page }: { page: AdvancesToSuppliersOverviewPageState }) {
  return (
    <ModuleTableToolbar
      className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none 2xl:!grid-cols-[minmax(0,1fr)_auto]"
      data-spotlight-id="maintenance-table-filters"
    >
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)]">
        <div className="sm:col-span-2 2xl:col-span-1">
          <ModuleTableSearch
            label="Search Advances to Suppliers"
            value={page.query}
            onChange={page.setQuery}
            placeholder="Search by Advances to Suppliers No., Party Name, Account Title, PO Reference, or Remarks"
          />
        </div>
        <DateRangePicker label="Date Range" value={page.dateRange} onChange={page.setDateRange} />
        <AmountRangePicker label="Total Amount" value={page.amountRange} onChange={page.setAmountRange} />
      </div>
      <div
        className="grid grid-cols-[2fr_1fr_1fr] gap-2 md:grid-cols-[minmax(0,1fr)_3.25rem_3.25rem] 2xl:w-[21.5rem]"
        data-spotlight-id="maintenance-table-options"
      >
        <ModuleTableFilterSelect
          label="Status"
          value={page.statusFilter}
          options={AdvancesToSuppliersStatusOptions.map((status) => ({ label: status, value: status }))}
          onChange={page.setStatusFilter}
        />
        <ModuleTableColumnVisibilityButton table={page.table} />
        <ModuleTableResetButton onClick={page.refreshRecords} />
      </div>
    </ModuleTableToolbar>
  );
}

function renderCell(columnId: string, record: AdvancesToSuppliersRecord, page: AdvancesToSuppliersOverviewPageState) {
  if (columnId === "transactionNo")
    return <span className={joinClasses("font-semibold", moduleAccentClassNames.iconText)}>{record.transactionNo}</span>;
  if (columnId === "amount") return <span className="font-semibold tabular-nums">{formatCurrency(record.amount)}</span>;
  if (["documentDate", "createdAt", "updatedAt"].includes(columnId))
    return formatDate(record[columnId as "documentDate" | "createdAt" | "updatedAt"], { emptyValue: "" });
  if (columnId === "status")
    return (
      <div className="flex w-full justify-center">
        <ModuleStatusBadge status={record.status} />
      </div>
    );
  if (columnId === "actions") return <AdvancesToSuppliersRecordActions record={record} onUpdateStatus={page.updateStatus} />;
  return null;
}
