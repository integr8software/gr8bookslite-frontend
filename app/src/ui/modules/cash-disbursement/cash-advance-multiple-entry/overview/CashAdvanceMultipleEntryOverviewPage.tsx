"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Ban,
  Edit3,
  Eye,
  Plus,
  ReceiptText,
  Search,
  ThumbsDown,
  ThumbsUp,
  Undo2,
} from "lucide-react";
import {
  CashAdvanceMultipleEntryHref,
  CashAdvanceMultipleEntryStatusFilterOptions,
  CashAdvanceMultipleEntryStatusFilters,
  CashAdvanceMultipleEntryStatuses,
  CashAdvanceMultipleEntryTablePaginationStorageKey,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import {
  countCashAdvanceMultipleEntriesByStatus,
  formatCashAdvanceMultipleEntryPercentage,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import {
  useCashAdvanceMultipleEntryStore,
  useCashAdvanceMultipleEntryTable,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";
import type { CashAdvanceMultipleEntryRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { formatCashAdvanceCurrency, formatCashAdvanceDate } from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import { AmountRangePicker } from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import { DateRangePicker } from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
  getModuleStatusMetricIcon,
  getModuleStatusMetricIconClassName,
  ModuleStatusBadge,
} from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
  getColumnMetaClassName,
  joinClasses,
} from "@/app/src/ui/shared/module/module-table/utils";
import {
  ModuleTableColumnVisibilityButton,
  ModuleTableFilterSelect,
  ModuleTableResetButton,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function CashAdvanceMultipleEntryOverviewPage() {
  const { entries, lastSyncedAt, updateEntryStatus } = useCashAdvanceMultipleEntryStore();
  const tableState = useCashAdvanceMultipleEntryTable(entries);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Cash Advance Multiple Entry"
        description="Search Cash Advance Multiple Entry records and open add, view, or edit forms."
        eyebrow={
          <>
            <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={<CashAdvanceMultipleEntryListHeaderActions />}
      />

      <CashAdvanceMultipleEntryMetrics
        records={entries}
        statusFilter={tableState.statusFilter}
        onStatusFilterChange={tableState.setStatusFilter}
      />

      <ModuleTable
        emptyDescription="Try another cash advance entry no., remarks, date range, amount range, or status."
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        emptyTitle="No Cash Advance Multiple Entry Transaction Found."
        minWidthClassName={getCashAdvanceMultipleEntryTableMinWidthClassName(
          tableState.table.getVisibleLeafColumns().length,
        )}
        paginationLabel="entries"
        paginationStorageKey={CashAdvanceMultipleEntryTablePaginationStorageKey}
        lastSyncedAt={lastSyncedAt}
        pageSizeOptions={[5, 10, 15, 20, 25, 50]}
        table={tableState.table}
        tableTitle="Cash Advances Multiple Entries"
        toolbar={
          <ModuleTableToolbar className="!grid-cols-1 !gap-2 !p-3 sm:!gap-2 sm:!p-3 xl:!grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_minmax(12rem,1fr)]">
              <ModuleTableSearch
                label="Search Cash Advances Multiple Entries"
                    placeholder="Search by Cash Advance Multiple Entry No., Party Name, account, or remarks"
                value={tableState.query}
                onChange={tableState.setQuery}
              />
              <DateRangePicker label="Date Range" value={tableState.dateRange} onChange={tableState.setDateRange} />
              <AmountRangePicker label="Total Amount" value={tableState.amountRange} onChange={tableState.setAmountRange} />
              <ModuleTableFilterSelect
                label="Status"
                value={tableState.statusFilter}
                options={CashAdvanceMultipleEntryStatusFilterOptions}
                onChange={(value) =>
                  tableState.setStatusFilter(
                    value as Parameters<typeof tableState.setStatusFilter>[0],
                  )
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2 xl:w-[7rem]">
              <ModuleTableColumnVisibilityButton table={tableState.table} />
              <ModuleTableResetButton
                className="px-2"
                onClick={tableState.resetFilters}
              >
                <span className="sr-only">Reset filters</span>
              </ModuleTableResetButton>
            </div>
          </ModuleTableToolbar>
        }
        renderRow={(row) => (
          <tr key={row.id} className="module-table-row border-b border-darknavy/8 last:border-b-0">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={joinClasses(
                  "px-4 py-4 align-middle",
                  getColumnMetaClassName(cell.column.columnDef.meta),
                )}
              >
                <CashAdvanceMultipleEntryCellContent
                  columnId={cell.column.id}
                  record={row.original}
                  onUpdateStatus={updateEntryStatus}
                />
              </td>
            ))}
          </tr>
        )}
      />
    </section>
  );
}

function getCashAdvanceMultipleEntryTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 13) return "min-w-[158rem]";
  if (visibleColumnCount >= 10) return "min-w-[126rem]";
  return "min-w-[82rem]";
}

function CashAdvanceMultipleEntryCellContent({
  columnId,
  onUpdateStatus,
  record,
}: {
  columnId: string;
  onUpdateStatus: (record: CashAdvanceMultipleEntryRecord, status: CashAdvanceStatus) => void;
  record: CashAdvanceMultipleEntryRecord;
}) {
  switch (columnId) {
    case "transNo":
      return <span className="font-semibold text-skyblue">{record.transNo}</span>;
    case "documentDate":
      return formatCashAdvanceDate(record.documentDate);
    case "partyName":
      return <span className="font-semibold text-darknavy">{record.partyName}</span>;
    case "partyCode":
      return <span className="font-semibold text-darknavy">{record.partyCode}</span>;
    case "accountCode":
      return <span className="font-semibold text-darknavy">{record.accountCode || "-"}</span>;
    case "accountTitle":
      return <span className="text-darknavy">{record.accountTitle || "-"}</span>;
    case "remarks":
      return <span className="line-clamp-2 text-sm text-darknavy/80">{record.remarks || "-"}</span>;
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCashAdvanceCurrency(record.amount)}</span>;
    case "createdBy":
      return record.createdBy ?? "";
    case "createdAt":
      return formatCashAdvanceMultipleEntryAuditDate(record.createdAt);
    case "updatedBy":
      return record.updatedBy ?? "";
    case "updatedAt":
      return formatCashAdvanceMultipleEntryAuditDate(record.updatedAt);
    case "status":
      return (
        <div className="flex w-full justify-center">
          <CashAdvanceMultipleEntryStatusBadge status={record.status} />
        </div>
      );
    case "actions":
      return <CashAdvanceMultipleEntryRecordActions record={record} onUpdateStatus={onUpdateStatus} />;
    default:
      return null;
  }
}

function formatCashAdvanceMultipleEntryAuditDate(value?: string) {
  return value ? formatCashAdvanceDate(value) : "";
}

function CashAdvanceMultipleEntryRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: (record: CashAdvanceMultipleEntryRecord, status: CashAdvanceStatus) => void;
  record: CashAdvanceMultipleEntryRecord;
}) {
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const recordLabel = record.transNo;
  const status = record.status;
  const isPosted = status === CashAdvanceMultipleEntryStatuses.posted;
  const isDisapproved = status === CashAdvanceMultipleEntryStatuses.disapproved;
  const isCancelled = status === CashAdvanceMultipleEntryStatuses.cancelled;
  const approvalUndoStatus: CashAdvanceStatus = CashAdvanceMultipleEntryStatuses.forApproval;
  const cancelStatus: CashAdvanceStatus = isCancelled
    ? CashAdvanceMultipleEntryStatuses.draft
    : CashAdvanceMultipleEntryStatuses.cancelled;
  const statusDialogCopy = statusToConfirm
    ? getCashAdvanceMultipleEntryStatusDialogCopy(statusToConfirm, recordLabel)
    : null;
  const items: ModuleActionMenuItem[] = [
    {
      href: `${CashAdvanceMultipleEntryHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditCashAdvanceMultipleEntryStatus(status)
      ? [
          {
            href: `${CashAdvanceMultipleEntryHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !canApproveCashAdvanceMultipleEntryStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => {
        if (isPosted) {
          onUpdateStatus(record, approvalUndoStatus);
          return;
        }

        setStatusToConfirm(CashAdvanceMultipleEntryStatuses.posted);
      },
      type: "button",
    },
    {
      disabled: !canDisapproveCashAdvanceMultipleEntryStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => {
        if (isDisapproved) {
          onUpdateStatus(record, approvalUndoStatus);
          return;
        }

        setStatusToConfirm(CashAdvanceMultipleEntryStatuses.disapproved);
      },
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelCashAdvanceMultipleEntryStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => {
        if (isCancelled) {
          onUpdateStatus(record, cancelStatus);
          return;
        }

        setStatusToConfirm(CashAdvanceMultipleEntryStatuses.cancelled);
      },
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <>
      <ModuleTableActions className="!justify-center">
        <ModuleActionMenu
          items={items}
          label={`Actions for Cash Advance Multiple Entry ${recordLabel}`}
        />
      </ModuleTableActions>
      {statusDialogCopy ? (
        <AppDialog
          isOpen
          title={statusDialogCopy.title}
          description={statusDialogCopy.description}
          cancelLabel="Keep Current Status"
          confirmLabel={statusDialogCopy.confirmLabel}
          iconTone={statusDialogCopy.iconTone}
          pendingLabel={statusDialogCopy.pendingLabel}
          tone={statusDialogCopy.tone}
          onCancel={() => setStatusToConfirm(null)}
          onConfirm={() => {
            if (!statusToConfirm) {
              return;
            }

            onUpdateStatus(record, statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}

function canEditCashAdvanceMultipleEntryStatus(status: CashAdvanceStatus) {
  return (
    status === CashAdvanceMultipleEntryStatuses.draft ||
    status === CashAdvanceMultipleEntryStatuses.forApproval
  );
}

function canApproveCashAdvanceMultipleEntryStatus(status: CashAdvanceStatus) {
  return (
    status === CashAdvanceMultipleEntryStatuses.forApproval ||
    status === CashAdvanceMultipleEntryStatuses.posted
  );
}

function canDisapproveCashAdvanceMultipleEntryStatus(status: CashAdvanceStatus) {
  return (
    status === CashAdvanceMultipleEntryStatuses.forApproval ||
    status === CashAdvanceMultipleEntryStatuses.disapproved
  );
}

function canCancelCashAdvanceMultipleEntryStatus(status: CashAdvanceStatus) {
  return (
    status === CashAdvanceMultipleEntryStatuses.draft ||
    status === CashAdvanceMultipleEntryStatuses.forApproval ||
    status === CashAdvanceMultipleEntryStatuses.cancelled
  );
}

function getCashAdvanceMultipleEntryStatusDialogCopy(status: CashAdvanceStatus, recordLabel: string) {
  if (status === CashAdvanceMultipleEntryStatuses.posted) {
    return {
      confirmLabel: "Approve Entry",
      description: `This will approve ${recordLabel} and update its status to Posted.`,
      iconTone: "approve" as const,
      pendingLabel: "Approving...",
      title: "Approve Cash Advance Multiple Entry?",
      tone: "success" as const,
    };
  }

  if (status === CashAdvanceMultipleEntryStatuses.disapproved) {
    return {
      confirmLabel: "Disapprove Entry",
      description: `This will mark ${recordLabel} as Disapproved.`,
      iconTone: "disapprove" as const,
      pendingLabel: "Disapproving...",
      title: "Disapprove Cash Advance Multiple Entry?",
      tone: "danger" as const,
    };
  }

  return {
    confirmLabel: "Mark as Cancelled",
    description: `This will mark ${recordLabel} as Cancelled.`,
    iconTone: "cancel" as const,
    pendingLabel: "Cancelling...",
    title: "Make Cash Advance Multiple Entry as Cancelled",
    tone: "danger" as const,
  };
}

function CashAdvanceMultipleEntryListHeaderActions() {
  return (
    <Link href={`${CashAdvanceMultipleEntryHref}/add`} className={moduleHeaderActionClassNames.primary}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Start New Cash Advance Multiple Entry
    </Link>
  );
}

function CashAdvanceMultipleEntryMetrics({
  onStatusFilterChange,
  records,
  statusFilter,
}: {
  onStatusFilterChange: (status: (typeof CashAdvanceMultipleEntryStatusFilters)[number]) => void;
  records: CashAdvanceMultipleEntryRecord[];
  statusFilter: (typeof CashAdvanceMultipleEntryStatusFilters)[number];
}) {
  const postedCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.posted);
  const disapprovedCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.disapproved);
  const draftCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.draft);
  const forApprovalCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.forApproval);
  const cancelledCount = countCashAdvanceMultipleEntriesByStatus(records, CashAdvanceMultipleEntryStatuses.cancelled);

  return (
    <ModuleStatisticCards
      className="2xl:grid-cols-6"
      items={[
        {
          label: "Total Entries",
          value: records.length,
          summary: "All time",
          icon: ReceiptText,
          tone: "violet",
          isActive: statusFilter === "all",
          onClick: () => onStatusFilterChange("all"),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.draft,
          value: draftCount,
          summary: formatCashAdvanceMultipleEntryPercentage(draftCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.draft),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.draft),
          tone: "blue",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.draft,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.draft),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.forApproval,
          value: forApprovalCount,
          summary: formatCashAdvanceMultipleEntryPercentage(forApprovalCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.forApproval),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.forApproval),
          tone: "amber",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.forApproval,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.forApproval),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.posted,
          value: postedCount,
          summary: formatCashAdvanceMultipleEntryPercentage(postedCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.posted),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.posted),
          tone: "emerald",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.posted,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.posted),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.disapproved,
          value: disapprovedCount,
          summary: formatCashAdvanceMultipleEntryPercentage(disapprovedCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.disapproved),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.disapproved),
          tone: "red",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.disapproved,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.disapproved),
        },
        {
          label: CashAdvanceMultipleEntryStatuses.cancelled,
          value: cancelledCount,
          summary: formatCashAdvanceMultipleEntryPercentage(cancelledCount, records.length),
          icon: getModuleStatusMetricIcon(CashAdvanceMultipleEntryStatuses.cancelled),
          iconClassName: getModuleStatusMetricIconClassName(CashAdvanceMultipleEntryStatuses.cancelled),
          tone: "slate",
          isActive: statusFilter === CashAdvanceMultipleEntryStatuses.cancelled,
          onClick: () => onStatusFilterChange(CashAdvanceMultipleEntryStatuses.cancelled),
        },
      ]}
    />
  );
}

function CashAdvanceMultipleEntryStatusBadge({ status }: { status: CashAdvanceStatus }) {
  return <ModuleStatusBadge status={status} />;
}
