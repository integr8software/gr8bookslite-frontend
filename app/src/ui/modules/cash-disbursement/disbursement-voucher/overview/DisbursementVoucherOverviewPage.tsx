"use client";

import Link from "next/link";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  DisbursementVoucherTablePaginationStorageKey,
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  DisbursementVoucherAddLink,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  useDisbursementVoucherPreviewTable,
  useDisbursementVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import type {
  DisbursementVoucherPreviewRow,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherRecordActions";
import { renderDisbursementVoucherTableCell } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherTableCell";
import { DisbursementVoucherTableToolbar } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherTableToolbar";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DisbursementVoucherOverviewPage() {
  const previewRows = useDisbursementVoucherStore((state) => state.previewRows);
  const lastSyncedAt = useDisbursementVoucherStore((state) => state.lastSyncedAt);
  const updateTransaction = useDisbursementVoucherStore((state) => state.updateTransaction);
  const updateVoucher = useDisbursementVoucherStore((state) => state.updateVoucher);
  const previewTable = useDisbursementVoucherPreviewTable(previewRows);

  function updatePreviewRowStatus(row: DisbursementVoucherPreviewRow, status: DisbursementVoucherStatus) {
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
        title="Disbursement Voucher"
        description="Search source transactions, preview linked vouchers, and create or update voucher entries."
        eyebrow={
          <>
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <Link
            href={DisbursementVoucherAddLink}
            className={moduleHeaderActionClassNames.primary}
            data-spotlight-id="maintenance-create-record"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start New Disbursement Voucher
          </Link>
        }
      />

      <ModuleStatisticCards className="2xl:grid-cols-6" items={previewTable.statisticCards} />

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm" data-spotlight-id="maintenance-table">
        <ModuleTable
          variant="embedded"
          emptyDescription="Try another DV No., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No Disbursement Voucher Transaction Found."
          minWidthClassName="min-w-full"
          paginationLabel="entries"
          paginationStorageKey={DisbursementVoucherTablePaginationStorageKey}
          lastSyncedAt={lastSyncedAt}
          table={previewTable.table}
          tableTitle="Disbursement Voucher Entries"
          toolbar={<DisbursementVoucherTableToolbar previewTable={previewTable} />}
          useColumnSizing
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 text-darknavy last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={joinClasses("px-4 py-4 align-middle text-sm text-darknavy", getColumnMetaClassName(cell.column.columnDef.meta))}
                >
                  {renderDisbursementVoucherTableCell(cell.column.id, row.original, () => (
                    <DisbursementVoucherRecordActions row={row.original} onUpdateStatus={updatePreviewRowStatus} />
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

function canUpdatePreviewRowStatus(currentStatus: DisbursementVoucherStatus, nextStatus: DisbursementVoucherStatus) {
  if (nextStatus === DisbursementVoucherStatuses.posted) {
    return canApproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.disapproved) {
    return canDisapproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.cancelled) {
    return canCancelDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.forApproval) {
    return (
      currentStatus === DisbursementVoucherStatuses.posted ||
      currentStatus === DisbursementVoucherStatuses.disapproved ||
      currentStatus === DisbursementVoucherStatuses.cancelled
    );
  }

  if (
    nextStatus === DisbursementVoucherStatuses.draft &&
    (currentStatus === DisbursementVoucherStatuses.posted || currentStatus === DisbursementVoucherStatuses.disapproved)
  ) {
    return true;
  }

  if (nextStatus === DisbursementVoucherStatuses.draft) {
    return currentStatus === DisbursementVoucherStatuses.cancelled;
  }

  return false;
}
