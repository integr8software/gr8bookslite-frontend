"use client";

import { useState } from "react";
import { Download, Home, Plus, Search, Sparkles, Upload } from "lucide-react";
import {
  PettyCashVoucherPaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherListPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherListPage";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { PettyCashVoucherListFilters } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherListFilters";
import { PettyCashVoucherTableRow } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTableRow";
import { PettyCashVoucherDrawer } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherDrawer";
import { usePettyCashVoucherFormPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherFormPage";
import type { PettyCashVoucherFormMode, PettyCashVoucherRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

type DrawerState = { mode: Exclude<PettyCashVoucherFormMode, "view">; voucher?: PettyCashVoucherRecord } | null;

export function PettyCashVoucherListPage() {
  const page = usePettyCashVoucherListPage();
  const [drawerState, setDrawerState] = useState<DrawerState>(null);

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] text-darknavy sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
        <ModuleHeader
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
          actions={<PettyCashVoucherHeaderActions onAdd={() => setDrawerState({ mode: "add" })} />}
        />

        <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
          <ModuleTable
            variant="embedded"
            emptyDescription="Adjust the filters or add a new voucher to view petty cash records."
            emptyTitle="No vouchers found"
            emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
            isLoading={page.isLoading}
            paginationLabel="vouchers"
            paginationStorageKey={PettyCashVoucherPaginationStorageKey}
            table={page.table}
            toolbar={<PettyCashVoucherListFilters page={page} />}
            renderRow={({ id, original }) => (
              <PettyCashVoucherTableRow
                key={id}
                row={original}
                onDelete={page.setPendingDelete}
                onEdit={(voucher) => setDrawerState({ mode: "edit", voucher })}
              />
            )}
          />
        </div>

        <AppDialog
          isOpen={Boolean(page.pendingDelete)}
          title="Delete petty cash voucher?"
          description={`This will remove ${page.pendingDelete?.voucherNo ?? "the selected voucher"}.`}
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => page.setPendingDelete(null)}
          onConfirm={page.handleConfirmDelete}
        />
        <PettyCashVoucherListDrawer drawerState={drawerState} onClose={() => setDrawerState(null)} />
      </main>
    </section>
  );
}

function PettyCashVoucherHeaderActions({ onAdd }: { onAdd: () => void }) {
  return (
    <>
      <button type="button" className={moduleHeaderActionClassNames.secondary}>
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Quick Tour
      </button>
      <button type="button" className={moduleHeaderActionClassNames.secondary}>
        <Upload className="h-4 w-4" aria-hidden="true" />
        Import
      </button>
      <button type="button" className={moduleHeaderActionClassNames.secondary}>
        <Download className="h-4 w-4" aria-hidden="true" />
        Export
      </button>
      <button
        type="button"
        onClick={onAdd}
        className={moduleHeaderActionClassNames.primary}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Voucher
      </button>
    </>
  );
}

function PettyCashVoucherListDrawer({ drawerState, onClose }: { drawerState: DrawerState; onClose: () => void }) {
  return drawerState ? <PettyCashVoucherListDrawerPanel key={`${drawerState.mode}-${drawerState.voucher?.id ?? "new"}`} drawerState={drawerState} onClose={onClose} /> : null;
}

function PettyCashVoucherListDrawerPanel({ drawerState, onClose }: { drawerState: NonNullable<DrawerState>; onClose: () => void }) {
  const page = usePettyCashVoucherFormPage({ existingVoucher: drawerState.voucher, mode: drawerState.mode, onSaved: onClose });
  return <PettyCashVoucherDrawer isOpen onClose={onClose} page={page} />;
}
