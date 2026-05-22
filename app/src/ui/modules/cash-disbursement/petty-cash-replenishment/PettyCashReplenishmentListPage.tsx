"use client";

import Link from "next/link";
import { Download, Home, Plus, Search } from "lucide-react";
import {
  PettyCashReplenishmentHref,
  PettyCashReplenishmentPaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { usePettyCashReplenishmentListPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentListPage";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import { PettyCashReplenishmentListFilters } from "./PettyCashReplenishmentListFilters";
import { PettyCashReplenishmentTableRow } from "./PettyCashReplenishmentTableRow";

export function PettyCashReplenishmentListPage() {
  const page = usePettyCashReplenishmentListPage();

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] text-darknavy sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
        <ModuleHeader
          variant="panel"
          title="Petty Cash Replenishment"
          titleAs="h1"
          description="View and manage petty cash replenishment records for cash disbursement."
          eyebrow={
            <>
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Cash disbursement
            </>
          }
          actions={
            <>
              <button
                type="button"
                className={moduleHeaderActionClassNames.secondary}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <button
                type="button"
                className={moduleHeaderActionClassNames.secondary}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export
              </button>
              <Link
                href={`${PettyCashReplenishmentHref}/add`}
                className={moduleHeaderActionClassNames.primary}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Replenishment
              </Link>
            </>
          }
        />

        <div className="rounded-xl border border-darknavy/10 bg-white shadow-sm">
          <PettyCashReplenishmentListFilters page={page} />

          <div className="p-4 sm:p-5">
            <ModuleTable
              emptyDescription="Adjust the filters or create a new replenishment record to view petty cash activity."
              emptyTitle="No replenishments found"
              emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
              isLoading={false}
              paginationLabel="replenishments"
              paginationStorageKey={PettyCashReplenishmentPaginationStorageKey}
              table={page.table}
              renderRow={({ id, original }) => (
                <PettyCashReplenishmentTableRow
                  key={id}
                  row={original}
                  onDelete={page.setPendingDelete}
                />
              )}
            />
          </div>
        </div>

        <AppConfirmDialog
          isOpen={Boolean(page.pendingDelete)}
          title="Delete petty cash replenishment?"
          description={`This will remove ${page.pendingDelete?.replenishmentNo ?? "the selected replenishment"}.`}
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => page.setPendingDelete(null)}
          onConfirm={page.handleConfirmDelete}
        />
      </main>
    </section>
  );
}
