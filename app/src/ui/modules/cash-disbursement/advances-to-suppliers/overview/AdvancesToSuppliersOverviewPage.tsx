"use client";

import Link from "next/link";
import { flexRender } from "@tanstack/react-table";
import { Landmark, Plus, Search } from "lucide-react";
import {
  AdvancesToSuppliersAddLink,
  AdvancesToSuppliersPaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import { useAdvancesToSuppliersOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersOverviewPage";
import { AdvancesToSuppliersRecordActions } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/overview/AdvancesToSuppliersRecordActions";
import { renderAdvancesToSuppliersTableCell } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/overview/AdvancesToSuppliersTableCell";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { AdvancesToSuppliersTableToolbar } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/overview/AdvancesToSuppliersTableToolbar";

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
            href={AdvancesToSuppliersAddLink}
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
          toolbar={
            <AdvancesToSuppliersTableToolbar page={page} />
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
                  {renderAdvancesToSuppliersTableCell(cell.column.id, row.original, () => (
                    <AdvancesToSuppliersRecordActions record={row.original} onUpdateStatus={page.updateStatus} />
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
