"use client";

import Link from "next/link";
import { Download, Home, Plus, Search, Sparkles, Upload } from "lucide-react";
import {
  PettyCashVoucherHref,
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

export function PettyCashVoucherListPage() {
  const page = usePettyCashVoucherListPage();

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
          actions={<PettyCashVoucherHeaderActions />}
        />

        <div className="rounded-xl border border-darknavy/10 bg-white shadow-sm">
          <PettyCashVoucherListFilters page={page} />

          <div className="p-4 sm:p-5">
            <ModuleTable
              emptyDescription="Adjust the filters or add a new voucher to view petty cash records."
              emptyTitle="No vouchers found"
              emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
              isLoading={false}
              paginationLabel="vouchers"
              paginationStorageKey={PettyCashVoucherPaginationStorageKey}
              table={page.table}
              renderRow={({ id, original }) => (
                <PettyCashVoucherTableRow
                  key={id}
                  row={original}
                  onDelete={page.setPendingDelete}
                />
              )}
            />
          </div>
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
      </main>
    </section>
  );
}

function PettyCashVoucherHeaderActions() {
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
      <Link
        href={`${PettyCashVoucherHref}/add`}
        className={moduleHeaderActionClassNames.primary}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Voucher
      </Link>
    </>
  );
}
