"use client";

import Link from "next/link";
import { flexRender } from "@tanstack/react-table";
import { Home, Plus, Search } from "lucide-react";
import {
  PettyCashVoucherTableCellClassName,
  PettyCashVoucherPaginationStorageKey,
  PettyCashVoucherAddLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherOverviewPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { PettyCashVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/overview/PettyCashVoucherRecordActions";
import { renderPettyCashVoucherTableCell } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/overview/PettyCashVoucherTableCell";
import { PettyCashVoucherTableToolbar } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/overview/PettyCashVoucherTableToolbar";

export function PettyCashVoucherOverviewPage() {
  const page = usePettyCashVoucherOverviewPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        data-spotlight-id="petty-cash-voucher-header"
        variant="panel"
        title="Petty Cash Voucher"
        titleAs="h1"
        description="Manage petty cash voucher records with the same modern module layout."
        eyebrow={
          <>
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={<PettyCashVoucherHeaderActions />}
      />

      <ModuleStatisticCards className="2xl:grid-cols-6" isLoading={page.isLoading} items={page.statisticCards} />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Adjust the filters or add a new voucher to view petty cash records."
          emptyTitle="No vouchers found"
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          isLoading={page.isLoading}
          lastSyncedAt={page.lastSyncedAt}
          paginationLabel="vouchers"
          paginationStorageKey={PettyCashVoucherPaginationStorageKey}
          table={page.table}
          tableTitle="Petty Cash Vouchers"
          toolbar={<PettyCashVoucherTableToolbar page={page} />}
          useColumnSizing
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 text-darknavy last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={joinClasses(
                    PettyCashVoucherTableCellClassName,
                    getColumnMetaClassName(cell.column.columnDef.meta),
                  )}
                >
                  {renderPettyCashVoucherTableCell(cell.column.id, row.original, () => (
                    <PettyCashVoucherRecordActions record={row.original} onUpdateStatus={page.handleUpdateStatus} />
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

function PettyCashVoucherHeaderActions() {
  return (
    <Link
      data-spotlight-id="maintenance-create-record"
      href={PettyCashVoucherAddLink}
      className={moduleHeaderActionClassNames.primary}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Start New Petty Cash Voucher
    </Link>
  );
}
