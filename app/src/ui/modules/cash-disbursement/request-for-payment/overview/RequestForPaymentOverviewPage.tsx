"use client";

import Link from "next/link";
import { flexRender } from "@tanstack/react-table";
import { Home, Plus, Search } from "lucide-react";
import {
  RequestForPaymentPaginationStorageKey,
  RequestForPaymentAddLink,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import { useRequestForPaymentOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/request-for-payment/useRequestForPaymentOverviewPage";
import { RequestForPaymentRecordActions } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/overview/RequestForPaymentRecordActions";
import { renderRequestForPaymentTableCell } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/overview/RequestForPaymentTableCell";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { RequestForPaymentTableToolbar } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/overview/RequestForPaymentTableToolbar";

export function RequestForPaymentOverviewPage() {
  const page = useRequestForPaymentOverviewPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        title="Request for Payment"
        titleAs="h1"
        description="Manage payment requisitions, multi-item disbursements, and approval tracking."
        eyebrow={
          <>
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            data-spotlight-id="maintenance-create-record"
            href={RequestForPaymentAddLink}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Request for Payment
          </Link>
        }
      />

      <ModuleStatisticCards className="2xl:grid-cols-6" items={page.statisticCards} />

      <div
        className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm"
        data-spotlight-id="maintenance-table"
      >
        <ModuleTable
          variant="embedded"
          emptyDescription="Adjust the filters or create a new payment request."
          emptyTitle="No Payment Request Transactions Found"
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          lastSyncedAt={page.lastSyncedAt}
          paginationLabel="entries"
          paginationStorageKey={RequestForPaymentPaginationStorageKey}
          table={page.table}
          tableTitle="Request for Payment Transactions"
          toolbar={<RequestForPaymentTableToolbar onRefresh={page.refreshRecords} page={page} />}
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
                  {renderRequestForPaymentTableCell(cell.column.id, row.original, () => (
                    <RequestForPaymentRecordActions record={row.original} onUpdateStatus={page.handleUpdateStatus} />
                  )) ?? flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          )}
        />
      </div>
    </section>
  );
}
