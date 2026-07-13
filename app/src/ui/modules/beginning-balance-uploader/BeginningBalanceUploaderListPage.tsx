"use client";

import Link from "next/link";
import { Download, FileSpreadsheet, Plus, Search, Upload } from "lucide-react";
import {
  BeginningBalanceUploaderHref,
  BeginningBalanceUploaderTablePaginationStorageKey,
} from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import { useBeginningBalanceUploaderListPage } from "@/app/src/hooks/modules/beginning-balance-uploader/useBeginningBalanceUploaderListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ModuleTableSearch, ModuleTableToolbar } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { BeginningBalanceUploaderTableRow } from "./BeginningBalanceUploaderTableRow";

export function BeginningBalanceUploaderListPage() {
  const page = useBeginningBalanceUploaderListPage();
  const draftCount = page.records.filter((record) => record.status === "Draft").length;
  const postedCount = page.records.filter((record) => record.status === "Posted").length;
  const totalEntries = page.records.reduce((total, record) => total + record.rows.length, 0);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Beginning Balance Uploader"
        description="Prepare, review, and manage opening accounting balances before posting."
        eyebrow={
          <>
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            Other transactions
          </>
        }
        actions={
          <>
            <button type="button" className={moduleHeaderActionClassNames.secondary}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload
            </button>
            <button type="button" className={moduleHeaderActionClassNames.secondary}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
            <Link
              href={`${BeginningBalanceUploaderHref}/add`}
              className={moduleHeaderActionClassNames.primary}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Beginning Balance
            </Link>
          </>
        }
      />

      <ModuleStatisticCards
        items={[
          {
            label: "Total Uploads",
            value: page.records.length,
            summary: "All beginning balances",
            icon: FileSpreadsheet,
            iconClassName: "bg-skyblue/20 text-skyblue",
          },
          {
            label: "Draft",
            value: draftCount,
            summary: "Ready for review",
            icon: FileSpreadsheet,
            iconClassName: "bg-offwhite text-darknavy",
          },
          {
            label: "Posted",
            value: postedCount,
            summary: "Completed uploads",
            icon: FileSpreadsheet,
            iconClassName: "bg-citron/25 text-darknavy",
          },
          {
            label: "Detail Entries",
            value: totalEntries,
            summary: "Across all uploads",
            icon: FileSpreadsheet,
            iconClassName: "bg-coralpink/15 text-coralpink",
          },
        ]}
        className="xl:grid-cols-4"
      />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another transaction number, date, remark, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No beginning balances found"
          isLoading={page.isLoading}
          lastSyncedAt={page.lastSyncedAt}
          minWidthClassName="min-w-[76rem]"
          paginationStorageKey={BeginningBalanceUploaderTablePaginationStorageKey}
          table={page.table}
          tableTitle="Beginning balance uploads"
          toolbar={
            <ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,1fr)]">
              <ModuleTableSearch
                label="Search beginning balances"
                value={page.query}
                onChange={page.handleQueryChange}
                placeholder="Search by transaction no., date, remarks, or status"
              />
            </ModuleTableToolbar>
          }
          renderRow={({ id, original }) => (
            <BeginningBalanceUploaderTableRow
              key={id}
              record={original}
              onDeleteRecord={page.setPendingDeleteRecord}
            />
          )}
        />
      </div>

      <AppDialog
        isOpen={Boolean(page.pendingDeleteRecord)}
        isPending={page.isMutating}
        title="Delete beginning balance?"
        description={`This will remove ${page.pendingDeleteRecord?.transactionNumber ?? "the selected beginning balance"}.`}
        confirmLabel="Delete Beginning Balance"
        tone="danger"
        onCancel={() => page.setPendingDeleteRecord(null)}
        onConfirm={page.handleConfirmDelete}
      />
    </section>
  );
}
