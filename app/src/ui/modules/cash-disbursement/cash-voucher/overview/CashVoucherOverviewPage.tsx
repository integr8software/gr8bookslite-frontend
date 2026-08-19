"use client";

import Link from "next/link";
import { Plus, ReceiptText, Search } from "lucide-react";
import {
  CashVoucherAllStatusFilter,
  CashVoucherTablePaginationStorageKey,
  CashVoucherStatuses,
  canApproveCashVoucherStatus,
  canCancelCashVoucherStatus,
  canDisapproveCashVoucherStatus,
  CashVoucherAddLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { getCashVoucherDisplayStatus } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import {
  useCashVoucherPreviewTable,
  useCashVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucher";
import type {
  CashVoucherPreviewRow,
  CashVoucherStatus,
  CashVoucherStatusFilter,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { CashVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherRecordActions";
import { renderCashVoucherTableCell } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherTableCell";
import { CashVoucherTableToolbar } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherTableToolbar";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { getModuleStatusMetricIcon, getModuleStatusMetricIconClassName } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { formatPartOfTotalPercentage } from "@/app/src/utils/percentage.util";

export function CashVoucherOverviewPage() {
  const previewRows = useCashVoucherStore((state) => state.previewRows);
  const lastSyncedAt = useCashVoucherStore((state) => state.lastSyncedAt);
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

      <CashVoucherMetrics
        previewRows={previewRows}
        statusFilter={previewTable.statusFilter}
        onStatusFilterChange={previewTable.setStatusFilter}
      />

      <div data-spotlight-id="maintenance-table">
        <ModuleTable
          emptyDescription="Try another voucher no., remarks, date range, amount range, or status."
          emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="No Cash Voucher Transaction Found."
          minWidthClassName="min-w-full"
          paginationLabel="entries"
          paginationStorageKey={CashVoucherTablePaginationStorageKey}
          lastSyncedAt={lastSyncedAt}
          pageSizeOptions={[5, 10, 15, 20, 25, 50]}
          table={previewTable.table}
          tableTitle="Cash Voucher Entries"
          toolbar={<CashVoucherTableToolbar previewTable={previewTable} />}
          useColumnSizing
          renderRow={(row) => (
            <tr key={row.id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={joinClasses("px-4 py-4 align-middle", getColumnMetaClassName(cell.column.columnDef.meta))}
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

function CashVoucherMetrics({
  onStatusFilterChange,
  previewRows,
  statusFilter,
}: {
  onStatusFilterChange: (status: CashVoucherStatusFilter) => void;
  previewRows: CashVoucherPreviewRow[];
  statusFilter: CashVoucherStatusFilter;
}) {
  const statusCounts = Object.fromEntries(
    Object.values(CashVoucherStatuses).map((status) => [
      status,
      previewRows.filter(
        (row) => getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status) === status,
      ).length,
    ]),
  ) as Record<CashVoucherStatus, number>;

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
          isActive: statusFilter === CashVoucherAllStatusFilter,
          onClick: () => onStatusFilterChange(CashVoucherAllStatusFilter),
        },
        ...[
          CashVoucherStatuses.draft,
          CashVoucherStatuses.forApproval,
          CashVoucherStatuses.posted,
          CashVoucherStatuses.disapproved,
          CashVoucherStatuses.cancelled,
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

function canUpdatePreviewRowStatus(currentStatus: CashVoucherStatus, nextStatus: CashVoucherStatus) {
  if (nextStatus === CashVoucherStatuses.posted) {
    return canApproveCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.disapproved) {
    return canDisapproveCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.cancelled) {
    return canCancelCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.forApproval) {
    return (
      currentStatus === CashVoucherStatuses.posted ||
      currentStatus === CashVoucherStatuses.disapproved ||
      currentStatus === CashVoucherStatuses.cancelled
    );
  }

  if (
    nextStatus === CashVoucherStatuses.draft &&
    (currentStatus === CashVoucherStatuses.posted || currentStatus === CashVoucherStatuses.disapproved)
  ) {
    return true;
  }

  if (nextStatus === CashVoucherStatuses.draft) {
    return currentStatus === CashVoucherStatuses.cancelled;
  }

  return false;
}


