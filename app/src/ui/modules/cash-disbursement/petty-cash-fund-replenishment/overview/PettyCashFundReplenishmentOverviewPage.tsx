"use client";

import Link from "next/link";
import {
  flexRender } from "@tanstack/react-table";
import { Landmark,
  Plus,
  Search } from "lucide-react";
import {
  PettyCashFundReplenishmentPaginationStorageKey,
  PettyCashFundReplenishmentAddLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { usePettyCashFundReplenishmentOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentOverviewPage";
import { PettyCashFundReplenishmentRecordActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/overview/PettyCashFundReplenishmentRecordActions";
import { renderPettyCashFundReplenishmentTableCell } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/overview/PettyCashFundReplenishmentTableCell";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { PettyCashFundReplenishmentTableToolbar } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/overview/PettyCashFundReplenishmentTableToolbar";

export function PettyCashFundReplenishmentOverviewPage() {
  const page = usePettyCashFundReplenishmentOverviewPage();
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        title="Petty Cash Fund Replenishment"
        titleAs="h1"
        description="Manage replenishment requests, supporting entries, and approval status."
        eyebrow={
          <>
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            data-spotlight-id="maintenance-create-record"
            href={PettyCashFundReplenishmentAddLink}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Petty Cash Fund Replenishment
          </Link>
        }
      />
      <ModuleStatisticCards className="2xl:grid-cols-6" isLoading={page.isLoading} items={page.statisticCards} />
      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Adjust the filters or start a new petty cash fund replenishment."
          emptyTitle="No Petty Cash Fund Replenishments Found"
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          isLoading={page.isLoading}
          lastSyncedAt={page.lastSyncedAt}
          paginationLabel="entries"
          paginationStorageKey={PettyCashFundReplenishmentPaginationStorageKey}
          table={page.table}
          tableTitle="Petty Cash Fund Replenishment Transactions"
          toolbar={
            <PettyCashFundReplenishmentTableToolbar onRefresh={page.refreshRecords} page={page} />
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
                  {renderPettyCashFundReplenishmentTableCell(cell.column.id, row.original, () => (
                    <PettyCashFundReplenishmentRecordActions record={row.original} onUpdateStatus={page.updateStatus} />
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
