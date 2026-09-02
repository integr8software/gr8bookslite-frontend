import { Ban, CalendarDays, CheckCircle2, Clock3, Edit3, Eye, PackageCheck, ThumbsDown, Undo2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";
import {
  JournalVoucherHref,
  canApproveJournalVoucherStatus,
  canCancelJournalVoucherStatus,
  canDisapproveJournalVoucherStatus,
  canEditJournalVoucherStatus,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import {
  formatJournalVoucherAmount,
  getJournalVoucherTotals,
} from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import type {
  JournalVoucherRecord,
  JournalVoucherStatus,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import type { JournalVoucherPermissions } from "@/app/src/services/modules/general-journal/journal-voucher/JournalVoucherService";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";

type JournalVoucherTableRowProps = {
  permissions: JournalVoucherPermissions;
  row: Row<JournalVoucherRecord>;
  onUpdateStatus: (record: JournalVoucherRecord, status: JournalVoucherStatus) => void;
};

export function JournalVoucherTableRow({ permissions, row, onUpdateStatus }: JournalVoucherTableRowProps) {
  const record = row.original;
  const totals = getJournalVoucherTotals(record.lines, record);
  const isPosted = record.status === "Posted";
  const isDisapproved = record.status === "Disapproved";
  const isCancelled = record.status === "Cancelled";
  const approvalUndoStatus: JournalVoucherStatus = "For Approval";
  const cancelStatus: JournalVoucherStatus = isCancelled ? "For Approval" : "Cancelled";
  const actionItems: ModuleActionMenuItem[] = [
    {
      href: `${JournalVoucherHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(permissions.canUpdate && canEditJournalVoucherStatus(record.status)
      ? [
          {
            href: `${JournalVoucherHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    ...(record.status === "Draft"
      ? [
          {
            disabled: !permissions.canSubmitForApproval,
            icon: Clock3,
            label: "Submit for Approval",
            onSelect: () => onUpdateStatus(record, "For Approval"),
            type: "button",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !permissions.canPost || !canApproveJournalVoucherStatus(record.status),
      icon: isPosted ? Undo2 : PackageCheck,
      label: isPosted ? "Undo Posted" : "Approve",
      onSelect: () => onUpdateStatus(record, isPosted ? approvalUndoStatus : "Posted"),
      type: "button",
    },
    {
      disabled: !permissions.canDisapprove || !canDisapproveJournalVoucherStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onUpdateStatus(record, isDisapproved ? approvalUndoStatus : "Disapproved"),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled:
        record.status === "Cancelled" ? !permissions.canUncancel : !permissions.canCancel || !canCancelJournalVoucherStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () => onUpdateStatus(record, cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <JournalVoucherTableCell key={cell.id} className={getColumnMetaClassName(cell.column.columnDef.meta)}>
          <JournalVoucherCellContent actionItems={actionItems} columnId={cell.column.id} record={record} totals={totals} />
        </JournalVoucherTableCell>
      ))}
    </tr>
  );
}

function JournalVoucherCellContent({
  actionItems,
  columnId,
  record,
  totals,
}: {
  actionItems: ModuleActionMenuItem[];
  columnId: string;
  record: JournalVoucherRecord;
  totals: ReturnType<typeof getJournalVoucherTotals>;
}) {
  switch (columnId) {
    case "transactionNo":
      return <span className="font-semibold">{record.transactionNo}</span>;
    case "documentDate":
      return (
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-skyblue" aria-hidden="true" />
          {record.documentDate}
        </span>
      );
    case "remarks":
      return <JournalVoucherRemarksCell remarks={record.remarks} />;
    case "currencyType":
      return (
        <>
          <div className="font-medium">{record.currencyType}</div>
          <div className="text-xs text-darknavy/55">Exchange Rate {formatJournalVoucherAmount(record.currencyRate)}</div>
        </>
      );
    case "totalDebit":
      return <span className="font-semibold tabular-nums">{formatJournalVoucherAmount(totals.totalDebit)}</span>;
    case "totalCredit":
      return <span className="font-semibold tabular-nums">{formatJournalVoucherAmount(totals.totalCredit)}</span>;
    case "status":
      return <JournalVoucherStatusBadge status={record.status} />;
    case "actions":
      return (
        <ModuleTableActions className="w-full !justify-center">
          <ModuleActionMenu items={actionItems} label={`Actions for journal voucher ${record.transactionNo}`} />
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function JournalVoucherRemarksCell({ remarks }: { remarks: string }) {
  const normalizedRemarks = remarks.trim();
  const displayRemarks = normalizedRemarks || "-";
  const remarksContent = <span className="line-clamp-3 whitespace-pre-line leading-5">{displayRemarks}</span>;

  if (!normalizedRemarks) {
    return remarksContent;
  }

  return (
    <ModuleTooltip
      align="start"
      className="min-w-0 max-w-full"
      contentClassName="max-w-sm whitespace-pre-line"
      position="top"
      title="Remarks"
      description={normalizedRemarks}
    >
      {remarksContent}
    </ModuleTooltip>
  );
}

function JournalVoucherTableCell({ className = "text-left", children }: { className?: string; children: ReactNode }) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}

function JournalVoucherStatusBadge({ status }: { status: JournalVoucherStatus }) {
  const Icon = statusIconByStatus[status];

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
        statusClassNameByStatus[status],
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

const statusIconByStatus = {
  Cancelled: Ban,
  Disapproved: XCircle,
  Draft: Clock3,
  "For Approval": CheckCircle2,
  Posted: PackageCheck,
} satisfies Record<JournalVoucherStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  "For Approval": "bg-citron/25 text-darknavy",
  Posted: "bg-skyblue/20 text-darknavy",
} satisfies Record<JournalVoucherStatus, string>;
