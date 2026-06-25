"use client";

import { useState } from "react";
import { Download, Home, Plus, Search } from "lucide-react";
import {
  PettyCashFundReplenishmentPaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { usePettyCashFundReplenishmentListPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentListPage";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { PettyCashFundReplenishmentListFilters } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentListFilters";
import { PettyCashFundReplenishmentTableRow } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTableRow";
import { PettyCashFundReplenishmentDrawer } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentDrawer";
import { usePettyCashFundReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentFormPage";
import type { PettyCashFundReplenishmentFormMode, PettyCashFundReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";

type DrawerState = { mode: Exclude<PettyCashFundReplenishmentFormMode, "view">; replenishment?: PettyCashFundReplenishmentRecord } | null;

export function PettyCashFundReplenishmentListPage() {
  const page = usePettyCashFundReplenishmentListPage();
  const [drawerState, setDrawerState] = useState<DrawerState>(null);

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] text-darknavy sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
        <ModuleHeader
          variant="panel"
          title="Petty Cash Fund Replenishment"
          titleAs="h1"
          description="View and manage petty cash fund replenishment records for cash disbursement."
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
              <button
                type="button"
                onClick={() => setDrawerState({ mode: "add" })}
                className={moduleHeaderActionClassNames.primary}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Replenishment
              </button>
            </>
          }
        />

        <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
          <ModuleTable
            variant="embedded"
            emptyDescription="Adjust the filters or create a new replenishment record to view petty cash activity."
            emptyTitle="No replenishments found"
            emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
            isLoading={page.isLoading}
            lastSyncedAt={page.lastSyncedAt}
            paginationLabel="replenishments"
            paginationStorageKey={PettyCashFundReplenishmentPaginationStorageKey}
            table={page.table}
            tableTitle="Fund replenishments"
            toolbar={<PettyCashFundReplenishmentListFilters page={page} />}
            renderRow={({ id, original }) => (
              <PettyCashFundReplenishmentTableRow
                key={id}
                row={original}
                onDelete={page.setPendingDelete}
                onEdit={(replenishment) => setDrawerState({ mode: "edit", replenishment })}
              />
            )}
          />
        </div>

        <AppDialog
          isOpen={Boolean(page.pendingDelete)}
          title="Delete petty cash fund replenishment?"
          description={`This will remove ${page.pendingDelete?.replenishmentNo ?? "the selected replenishment"}.`}
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => page.setPendingDelete(null)}
          onConfirm={page.handleConfirmDelete}
        />
        <PettyCashFundReplenishmentListDrawer drawerState={drawerState} onClose={() => setDrawerState(null)} />
      </main>
    </section>
  );
}

function PettyCashFundReplenishmentListDrawer({ drawerState, onClose }: { drawerState: DrawerState; onClose: () => void }) {
  return drawerState ? <PettyCashFundReplenishmentListDrawerPanel key={`${drawerState.mode}-${drawerState.replenishment?.id ?? "new"}`} drawerState={drawerState} onClose={onClose} /> : null;
}

function PettyCashFundReplenishmentListDrawerPanel({ drawerState, onClose }: { drawerState: NonNullable<DrawerState>; onClose: () => void }) {
  const page = usePettyCashFundReplenishmentFormPage({ existingReplenishment: drawerState.replenishment, mode: drawerState.mode, onSaved: onClose });
  return <PettyCashFundReplenishmentDrawer isOpen onClose={onClose} page={page} />;
}
