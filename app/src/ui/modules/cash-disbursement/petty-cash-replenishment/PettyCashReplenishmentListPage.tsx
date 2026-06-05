"use client";

import { useState } from "react";
import { Download, Home, Plus, Search } from "lucide-react";
import {
  PettyCashReplenishmentPaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { usePettyCashReplenishmentListPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentListPage";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { PettyCashReplenishmentListFilters } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentListFilters";
import { PettyCashReplenishmentTableRow } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTableRow";
import { PettyCashReplenishmentDrawer } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentDrawer";
import { usePettyCashReplenishmentFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentFormPage";
import type { PettyCashReplenishmentFormMode, PettyCashReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

type DrawerState = { mode: Exclude<PettyCashReplenishmentFormMode, "view">; replenishment?: PettyCashReplenishmentRecord } | null;

export function PettyCashReplenishmentListPage() {
  const page = usePettyCashReplenishmentListPage();
  const [drawerState, setDrawerState] = useState<DrawerState>(null);

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
            paginationLabel="replenishments"
            paginationStorageKey={PettyCashReplenishmentPaginationStorageKey}
            table={page.table}
            toolbar={<PettyCashReplenishmentListFilters page={page} />}
            renderRow={({ id, original }) => (
              <PettyCashReplenishmentTableRow
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
          title="Delete petty cash replenishment?"
          description={`This will remove ${page.pendingDelete?.replenishmentNo ?? "the selected replenishment"}.`}
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => page.setPendingDelete(null)}
          onConfirm={page.handleConfirmDelete}
        />
        <PettyCashReplenishmentListDrawer drawerState={drawerState} onClose={() => setDrawerState(null)} />
      </main>
    </section>
  );
}

function PettyCashReplenishmentListDrawer({ drawerState, onClose }: { drawerState: DrawerState; onClose: () => void }) {
  return drawerState ? <PettyCashReplenishmentListDrawerPanel key={`${drawerState.mode}-${drawerState.replenishment?.id ?? "new"}`} drawerState={drawerState} onClose={onClose} /> : null;
}

function PettyCashReplenishmentListDrawerPanel({ drawerState, onClose }: { drawerState: NonNullable<DrawerState>; onClose: () => void }) {
  const page = usePettyCashReplenishmentFormPage({ existingReplenishment: drawerState.replenishment, mode: drawerState.mode, onSaved: onClose });
  return <PettyCashReplenishmentDrawer isOpen onClose={onClose} page={page} />;
}
