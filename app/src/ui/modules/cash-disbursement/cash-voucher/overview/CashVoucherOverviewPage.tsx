"use client";

import Link from "next/link";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  CashVoucherTablePaginationStorageKey,
  CashVoucherStatuses,
  canApproveCashVoucherStatus,
  canCancelCashVoucherStatus,
  canDisapproveCashVoucherStatus,
  CashVoucherAddLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import {
  useCashVoucherPreviewTable,
  useCashVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucher";
import type {
  CashVoucherPreviewRow,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { CashVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherRecordActions";
import { renderCashVoucherTableCell } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherTableCell";
import { CashVoucherTableToolbar } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherTableToolbar";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function CashVoucherOverviewPage() {
  const previewRows = useCashVoucherStore((state) => state.previewRows);
  const isLoading = useCashVoucherStore((state) => state.isLoading);
  const lastSyncedAt = useCashVoucherStore((state) => state.lastSyncedAt);
  const refreshRecords = useCashVoucherStore((state) => state.refreshRecords);
  const updateTransaction = useCashVoucherStore((state) => state.updateTransaction);
  const updateVoucher = useCashVoucherStore((state) => state.updateVoucher);
  const previewTable = useCashVoucherPreviewTable(previewRows);

  function updatePreviewRowStatus(row: CashVoucherPreviewRow, status: CashVoucherStatus) {
    const currentStatus = row.voucher?.status ?? row.transaction.status;

    if (!canUpdatePreviewRowStatus(currentStatus, status)) {
      return;
    }

    const updatedAt = new Date().toISOString();

    if (row.voucher) {
      updateVoucher({
        ...row.voucher,
        status,
        updatedBy: "Current User",
        updatedAt,
      });
      return;
    }

    updateTransaction({
      ...row.transaction,
      status,
      updatedBy: "Current User",
      updatedAt,
    });
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Cash Voucher"
        description="Search source transactions, preview linked vouchers, and create or update voucher entries."
        eyebrow={
          <>
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            href={CashVoucherAddLink}
            className={moduleHeaderActionClassNames.primary}
            data-spotlight-id="maintenance-create-record"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Cash Voucher
          </Link>
        }
      />

      <ModuleStatisticCards className="2xl:grid-cols-6" isLoading={isLoading} items={previewTable.statisticCards} />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another Voucher No., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No Cash Voucher Transaction Found"
          minWidthClassName="min-w-full"
          paginationLabel="entries"
          paginationStorageKey={CashVoucherTablePaginationStorageKey}
          isLoading={isLoading}
          lastSyncedAt={lastSyncedAt}
          table={previewTable.table}
          tableTitle="Cash Voucher Entries"
          toolbar={<CashVoucherTableToolbar onRefresh={refreshRecords} previewTable={previewTable} />}
          useColumnSizing
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 text-darknavy last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={joinClasses("px-4 py-4 align-middle text-sm text-darknavy", getColumnMetaClassName(cell.column.columnDef.meta))}
                >
                  {renderCashVoucherTableCell(cell.column.id, row.original, () => (
                    <CashVoucherRecordActions row={row.original} onUpdateStatus={updatePreviewRowStatus} />
                  ))}
                </td>
              ))}
            </tr>
          )}
        />
      </div>
    </section>
  );
}

function canUpdatePreviewRowStatus(currentStatus: CashVoucherStatus, nextStatus: CashVoucherStatus) {
  if (nextStatus === CashVoucherStatuses.Posted) {
    return canApproveCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.Disapproved) {
    return canDisapproveCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.Cancelled) {
    return canCancelCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.ForApproval) {
    return (
      currentStatus === CashVoucherStatuses.Posted ||
      currentStatus === CashVoucherStatuses.Disapproved ||
      currentStatus === CashVoucherStatuses.Cancelled
    );
  }

  if (
    nextStatus === CashVoucherStatuses.Draft &&
    (currentStatus === CashVoucherStatuses.Posted || currentStatus === CashVoucherStatuses.Disapproved)
  ) {
    return true;
  }

  if (nextStatus === CashVoucherStatuses.Draft) {
    return currentStatus === CashVoucherStatuses.Cancelled;
  }

  return false;
}
