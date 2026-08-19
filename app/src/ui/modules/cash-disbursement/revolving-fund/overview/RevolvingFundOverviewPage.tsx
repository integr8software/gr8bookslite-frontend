"use client";

import Link from "next/link";
import {
  flexRender } from "@tanstack/react-table";
import { Home,
  Plus,
  Search } from "lucide-react";
import {
  RevolvingFundPaginationStorageKey,
  RevolvingFundAddLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { useRevolvingFundOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundOverviewPage";
import { RevolvingFundRecordActions } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/overview/RevolvingFundRecordActions";
import { renderRevolvingFundTableCell } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/overview/RevolvingFundTableCell";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { RevolvingFundTableToolbar } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/overview/RevolvingFundTableToolbar";

export function RevolvingFundOverviewPage() {
  const page = useRevolvingFundOverviewPage();
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        title="Revolving Fund"
        titleAs="h1"
        description="Manage revolving fund parties, balances, detailed transactions, and accounting entries."
        eyebrow={
          <>
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            data-spotlight-id="maintenance-create-record"
            href={RevolvingFundAddLink}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Revolving Fund
          </Link>
        }
      />
      <ModuleStatisticCards className="2xl:grid-cols-6" isLoading={page.isLoading} items={page.statisticCards} />
      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Adjust the filters or start a new revolving fund."
          emptyTitle="No Revolving Fund Transactions Found"
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          isLoading={page.isLoading}
          lastSyncedAt={page.lastSyncedAt}
          paginationLabel="entries"
          paginationStorageKey={RevolvingFundPaginationStorageKey}
          table={page.table}
          tableTitle="Revolving Fund Transactions"
          toolbar={
            <RevolvingFundTableToolbar page={page} />
          }
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
                  {renderRevolvingFundTableCell(cell.column.id, row.original, () => (
                    <RevolvingFundRecordActions record={row.original} onUpdateStatus={page.updateStatus} />
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
