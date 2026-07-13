"use client";

import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import {
  JournalVoucherHref,
  JournalVoucherTablePaginationStorageKey,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import { useJournalVoucherListPage } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucherListPage";
import { JournalVoucherTableRow } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherTableRow";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function JournalVoucherListPage() {
  const {
    handleConfirmDelete,
    handleQueryChange,
    isLoading,
    isMutating,
    lastSyncedAt,
    pendingDeleteRecord,
    query,
    setPendingDeleteRecord,
    table,
  } = useJournalVoucherListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Journal Voucher"
        description="Record manual journal vouchers with balanced debit and credit entries."
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            General journal
          </>
        }
        actions={
          <Link
            href={`${JournalVoucherHref}/add`}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Link>
        }
      />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another transaction number, date, remarks, currency, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No journal vouchers found"
          isLoading={isLoading}
          lastSyncedAt={lastSyncedAt}
          minWidthClassName="min-w-[76rem]"
          paginationStorageKey={JournalVoucherTablePaginationStorageKey}
          table={table}
          tableTitle="Journal vouchers"
          toolbar={
            <ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
              <ModuleTableSearch
                label="Search journal vouchers"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search by transaction no., remarks, currency, or status"
              />
            </ModuleTableToolbar>
          }
          renderRow={({ id, original }) => (
            <JournalVoucherTableRow
              key={id}
              record={original}
              onDeleteRecord={setPendingDeleteRecord}
            />
          )}
        />
      </div>

      <AppDialog
        isOpen={Boolean(pendingDeleteRecord)}
        isPending={isMutating}
        title="Delete journal voucher?"
        description={`This will remove ${pendingDeleteRecord?.transactionNo ?? "the selected journal voucher"}.`}
        confirmLabel="Delete Journal Voucher"
        tone="danger"
        onCancel={() => setPendingDeleteRecord(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
