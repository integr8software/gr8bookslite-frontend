"use client";

import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";
import {
  CashVoucherHref,
  CashVoucherStatuses,
  CashVoucherStatusFilterOptions,
  canApproveCashVoucherStatus,
  canCancelCashVoucherStatus,
  canDisapproveCashVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import {
  useCashVoucherPreviewTable,
  useCashVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucher";
import type {
  CashVoucherPreviewRow,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { CashVoucherTable } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherTable";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableResetButton,
  ModuleTableFilterSelect,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { CashVoucherMetrics } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherMetrics";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";

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
            href={`${CashVoucherHref}/add`}
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
        <CashVoucherTable
          lastSyncedAt={lastSyncedAt}
          table={previewTable.table}
          toolbar={
            <ModuleTableToolbar
              className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 2xl:!grid-cols-[minmax(0,1fr)_auto]"
              data-spotlight-id="maintenance-table-filters"
            >
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)]">
                <div className="sm:col-span-2 2xl:col-span-1">
                  <ModuleTableSearch
                    label="Search cash vouchers"
                    value={previewTable.query}
                    onChange={previewTable.setQuery}
                    placeholder="Search by Voucher No., Transaction No., Payee, or Remarks"
                  />
                </div>
                <DateRangePicker label="Date Range" value={previewTable.dateRange} onChange={previewTable.setDateRange} />
                <AmountRangePicker label="Total Amount" value={previewTable.amountRange} onChange={previewTable.setAmountRange} />
              </div>
              <div
                className="grid grid-cols-[2fr_1fr_1fr] gap-2 md:grid-cols-[minmax(0,1fr)_3.25rem_3.25rem] 2xl:w-[21.5rem]"
                data-spotlight-id="maintenance-table-options"
              >
                <ModuleTableFilterSelect
                  label="Status"
                  value={previewTable.statusFilter}
                  options={CashVoucherStatusFilterOptions}
                  onChange={(value) => previewTable.setStatusFilter(value as (typeof previewTable.statusOptions)[number])}
                />
                <ModuleTableColumnVisibilityButton table={previewTable.table} />
                <ModuleTableResetButton className="px-2" onClick={previewTable.resetFilters} />
              </div>
            </ModuleTableToolbar>
          }
          onUpdateStatus={updatePreviewRowStatus}
        />
      </div>
    </section>
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


