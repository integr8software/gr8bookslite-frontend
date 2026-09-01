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
import { formatCreditMemoAmount } from "@/app/src/data/modules/general-journal/credit-memo/CreditMemoData";
import type {
  CreditMemoRecord,
  CreditMemoStatus,
} from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
  getColumnMetaClassName,
  joinClasses,
} from "@/app/src/ui/shared/module/module-table/utils";
import { CreditMemoRecordActions } from "@/app/src/ui/modules/general-journal/credit-memo/CreditMemoRecordActions";

type CreditMemoTableRowProps = {
  row: Row<CreditMemoRecord>;
  onUpdateStatus: (record: CreditMemoRecord, status: CreditMemoStatus) => void;
};

export function CreditMemoTableRow({
  row,
  onUpdateStatus,
}: CreditMemoTableRowProps) {
  const record = row.original;

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <CreditMemoTableCell
          key={cell.id}
          className={getColumnMetaClassName(cell.column.columnDef.meta)}
        >
          <CreditMemoCellContent
            columnId={cell.column.id}
            record={record}
            onUpdateStatus={onUpdateStatus}
          />
        </CreditMemoTableCell>
      ))}
    </tr>
  );
}

function CreditMemoCellContent({
  columnId,
  onUpdateStatus,
  record,
}: {
  columnId: string;
  onUpdateStatus: (record: CreditMemoRecord, status: CreditMemoStatus) => void;
  record: CreditMemoRecord;
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
      return <CreditMemoRemarksCell remarks={record.remarks} />;
    case "amount":
      return <span className="font-semibold tabular-nums">{formatCreditMemoAmount(record.amount)}</span>;
    case "currency":
      return (
        <>
          <div className="font-medium">{record.currency}</div>
          <div className="text-xs text-darknavy/55">Exchange Rate {formatCreditMemoAmount(record.exchangeRate)}</div>
        </>
      );
    case "status":
      return <CreditMemoStatusBadge status={record.status} />;
    case "actions":
      return <CreditMemoRecordActions record={record} onUpdateStatus={onUpdateStatus} />;
    default:
      return null;
  }
}

function CreditMemoRemarksCell({ remarks }: { remarks: string }) {
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

function CreditMemoTableCell({
  className = "text-left",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>{children}</td>;
}

export function CreditMemoStatusBadge({ status }: { status: CreditMemoStatus }) {
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
} satisfies Record<CreditMemoStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  "For Approval": "bg-citron/25 text-darknavy",
  Posted: "bg-skyblue/20 text-darknavy",
} satisfies Record<CreditMemoStatus, string>;
