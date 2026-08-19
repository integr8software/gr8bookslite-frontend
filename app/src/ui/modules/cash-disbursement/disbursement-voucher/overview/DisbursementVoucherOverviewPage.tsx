"use client";

import Link from "next/link";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  DisbursementVoucherAllStatusFilter,
  DisbursementVoucherTablePaginationStorageKey,
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  DisbursementVoucherAddLink,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { getDisbursementVoucherDisplayStatus } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  useDisbursementVoucherPreviewTable,
  useDisbursementVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import type {
  DisbursementVoucherPreviewRow,
  DisbursementVoucherStatus,
  DisbursementVoucherStatusFilter,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherRecordActions";
import { renderDisbursementVoucherTableCell } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherTableCell";
import { DisbursementVoucherTableToolbar } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherTableToolbar";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";

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

      <DisbursementVoucherMetrics
        previewRows={previewRows}
        statusFilter={previewTable.statusFilter}
        onStatusFilterChange={previewTable.setStatusFilter}
      />

      <div data-spotlight-id="maintenance-table">
        <ModuleTable
          emptyDescription="Try another voucher no., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No Disbursement Voucher Transaction Found."
          minWidthClassName="min-w-full"
          paginationLabel="entries"
          paginationStorageKey={DisbursementVoucherTablePaginationStorageKey}
          lastSyncedAt={lastSyncedAt}
          pageSizeOptions={[5, 10, 15, 20, 25, 50]}
          table={previewTable.table}
          tableTitle="Disbursement Voucher Entries"
          toolbar={<DisbursementVoucherTableToolbar previewTable={previewTable} />}
          useColumnSizing
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={joinClasses("px-4 py-4 align-middle", getColumnMetaClassName(cell.column.columnDef.meta))}
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

function DisbursementVoucherMetrics({
  onStatusFilterChange,
  previewRows,
  statusFilter,
}: {
  onStatusFilterChange: (status: DisbursementVoucherStatusFilter) => void;
  previewRows: DisbursementVoucherPreviewRow[];
  statusFilter: DisbursementVoucherStatusFilter;
}) {
  const statusCounts = Object.fromEntries(
    Object.values(DisbursementVoucherStatuses).map((status) => [
      status,
      previewRows.filter(
        (row) => getDisbursementVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status) === status,
      ).length,
    ]),
  ) as Record<DisbursementVoucherStatus, number>;

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-6"
      items={[
        {
          label: "Total Entries",
          value: previewRows.length,
          summary: "All time",
          icon: ReceiptText,
          tone: "violet",
          isActive: statusFilter === DisbursementVoucherAllStatusFilter,
          onClick: () => onStatusFilterChange(DisbursementVoucherAllStatusFilter),
        },
        ...[
          DisbursementVoucherStatuses.draft,
          DisbursementVoucherStatuses.forApproval,
          DisbursementVoucherStatuses.posted,
          DisbursementVoucherStatuses.disapproved,
          DisbursementVoucherStatuses.cancelled,
        ].map((status, index) => ({
          label: status,
          value: statusCounts[status],
          summary: formatPartOfTotalPercentage(statusCounts[status], previewRows.length),
          icon: getModuleStatusMetricIcon(status),
          iconClassName: getModuleStatusMetricIconClassName(status),
          tone: (["blue", "amber", "emerald", "red", "slate"] as const)[index],
          isActive: statusFilter === status,
          onClick: () => onStatusFilterChange(status),
        })),
      ]}
    />
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
