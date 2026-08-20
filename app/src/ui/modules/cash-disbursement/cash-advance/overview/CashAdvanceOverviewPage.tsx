"use client";

import Link from "next/link";
import { flexRender } from "@tanstack/react-table";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  CashAdvanceTablePaginationStorageKey,
  getCashAdvanceTableMinWidthClassName,
  CashAdvanceAddLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { useCashAdvanceStore, useCashAdvanceTable } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import { CashAdvanceTableToolbar } from "@/app/src/ui/modules/cash-disbursement/cash-advance/overview/CashAdvanceTableToolbar";
import { renderCashAdvanceTableCell } from "@/app/src/ui/modules/cash-disbursement/cash-advance/overview/CashAdvanceTableCell";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { CashAdvanceRecordActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance/overview/CashAdvanceRecordActions";

export function CashAdvanceOverviewPage() {
  const { advances, lastSyncedAt, updateAdvanceStatus } = useCashAdvanceStore();
  const tableState = useCashAdvanceTable(advances);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        title="Cash Advance"
        titleAs="h1"
        description="Search cash advance records, review status, and open the matching add, view, or edit form."
        eyebrow={
          <>
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            data-spotlight-id="maintenance-create-record"
            href={CashAdvanceAddLink}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Cash Advance
          </Link>
        }
      />

      <ModuleStatisticCards className="2xl:grid-cols-6" items={tableState.statisticCards} />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another cash advance no., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No Cash Advance Transaction Found."
          minWidthClassName={getCashAdvanceTableMinWidthClassName(tableState.table.getVisibleLeafColumns().length)}
          paginationLabel="entries"
          paginationStorageKey={CashAdvanceTablePaginationStorageKey}
          lastSyncedAt={lastSyncedAt}
          table={tableState.table}
          tableTitle="Cash Advances"
          useColumnSizing
          toolbar={<CashAdvanceTableToolbar tableState={tableState} />}
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 text-darknavy last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={joinClasses("px-4 py-4 align-middle text-sm text-darknavy", getColumnMetaClassName(cell.column.columnDef.meta))}
                >
                  {renderCashAdvanceTableCell(cell.column.id, row.original, () => (
                    <CashAdvanceRecordActions record={row.original} onUpdateStatus={updateAdvanceStatus} />
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

