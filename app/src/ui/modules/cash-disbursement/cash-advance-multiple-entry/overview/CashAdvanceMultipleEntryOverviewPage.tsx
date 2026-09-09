"use client";

import Link from "next/link";
import { flexRender } from "@tanstack/react-table";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  CashAdvanceMultipleEntryTablePaginationStorageKey,
  CashAdvanceMultipleEntryAddLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import { getTransactionOverviewTableMinWidthClassName } from "@/app/src/constants/shared/module/TransactionOverviewConstants";
import {
  useCashAdvanceMultipleEntryStore,
  useCashAdvanceMultipleEntryTable,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import { CashAdvanceMultipleEntryRecordActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/overview/CashAdvanceMultipleEntryRecordActions";
import { CashAdvanceMultipleEntryTableToolbar } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/overview/CashAdvanceMultipleEntryTableToolbar";
import { renderCashAdvanceMultipleEntryTableCell } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/overview/CashAdvanceMultipleEntryTableCell";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function CashAdvanceMultipleEntryOverviewPage() {
  const { entries, isLoading, lastSyncedAt, refreshRecords, updateEntryStatus } = useCashAdvanceMultipleEntryStore();
  const tableState = useCashAdvanceMultipleEntryTable(entries);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        title="Cash Advance Multiple Entry"
        titleAs="h1"
        description="Search Cash Advance Multiple Entry records and open add, view, or edit forms."
        eyebrow={
          <>
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            data-spotlight-id="maintenance-create-record"
            href={CashAdvanceMultipleEntryAddLink}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Cash Advance Multiple Entry
          </Link>
        }
      />

      <ModuleStatisticCards className="2xl:grid-cols-6" isLoading={isLoading} items={tableState.statisticCards} />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another Multiple Cash Advance No., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No Cash Advance Multiple Entry Transaction Found"
          minWidthClassName={getTransactionOverviewTableMinWidthClassName(tableState.table.getVisibleLeafColumns().length)}
          paginationLabel="entries"
          paginationStorageKey={CashAdvanceMultipleEntryTablePaginationStorageKey}
          isLoading={isLoading}
          lastSyncedAt={lastSyncedAt}
          table={tableState.table}
          tableTitle="Cash Advances Multiple Entries"
          useColumnSizing
          toolbar={<CashAdvanceMultipleEntryTableToolbar onRefresh={refreshRecords} tableState={tableState} />}
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 text-darknavy last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={joinClasses("px-4 py-4 align-middle text-sm text-darknavy", getColumnMetaClassName(cell.column.columnDef.meta))}>
                  {renderCashAdvanceMultipleEntryTableCell(cell.column.id, row.original, () => (
                    <CashAdvanceMultipleEntryRecordActions record={row.original} onUpdateStatus={updateEntryStatus} />
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

