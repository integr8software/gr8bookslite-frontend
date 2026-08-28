"use client";

import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { formatDebitMemoAmount } from "@/app/src/data/modules/general-journal/debit-memo/DebitMemoData";
import type {
  DebitMemoRecord,
  DebitMemoStatus,
} from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
  getColumnMetaClassName,
  joinClasses,
} from "@/app/src/ui/shared/module/module-table/utils";
import { DebitMemoRecordActions } from "@/app/src/ui/modules/general-journal/debit-memo/DebitMemoRecordActions";

type DebitMemoTableRowProps = {
  row: Row<DebitMemoRecord>;
  onUpdateStatus: (record: DebitMemoRecord, status: DebitMemoStatus) => void;
};

export function DebitMemoTableRow({
  row,
  onUpdateStatus,
}: DebitMemoTableRowProps) {
  const record = row.original;

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <DebitMemoTableCell
          key={cell.id}
          className={getColumnMetaClassName(cell.column.columnDef.meta)}
        >
          <DebitMemoCellContent
            columnId={cell.column.id}
            record={record}
            onUpdateStatus={onUpdateStatus}
          />
        </DebitMemoTableCell>
      ))}
    </tr>
  );
}

function DebitMemoCellContent({
  columnId,
  onUpdateStatus,
  record,
}: {
  columnId: string;
  onUpdateStatus: (record: DebitMemoRecord, status: DebitMemoStatus) => void;
  record: DebitMemoRecord;
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
    case "partyName":
      return (
        <>
          <div className="font-medium">{record.partyName || "No party"}</div>
          <div className="text-xs text-darknavy/55">{record.partyCode || "No party code"}</div>
        </>
      );
    case "referenceNo":
      return <span>{record.referenceNo || "-"}</span>;
    case "remarks":
      return <DebitMemoRemarksCell remarks={record.remarks} />;
    case "amount":
      return <span className="font-semibold tabular-nums">{formatDebitMemoAmount(record.amount)}</span>;
    case "currency":
      return (
        <>
          <div className="font-medium">{record.currency}</div>
          <div className="text-xs text-darknavy/55">Exchange Rate {formatDebitMemoAmount(record.exchangeRate)}</div>
        </>
      );
    case "status":
      return <DebitMemoStatusBadge status={record.status} />;
    case "actions":
      return <DebitMemoRecordActions record={record} onUpdateStatus={onUpdateStatus} />;
    default:
      return null;
  }
}

function DebitMemoRemarksCell({ remarks }: { remarks: string }) {
  const normalizedRemarks = remarks.trim();
  const displayRemarks = normalizedRemarks || "-";
  const remarksContent = (
    <span className="line-clamp-3 whitespace-pre-line leading-5">{displayRemarks}</span>
  );

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

function DebitMemoTableCell({
  className = "text-left",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}

export function DebitMemoStatusBadge({ status }: { status: DebitMemoStatus }) {
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
} satisfies Record<DebitMemoStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  "For Approval": "bg-citron/25 text-darknavy",
  Posted: "bg-skyblue/20 text-darknavy",
} satisfies Record<DebitMemoStatus, string>;
