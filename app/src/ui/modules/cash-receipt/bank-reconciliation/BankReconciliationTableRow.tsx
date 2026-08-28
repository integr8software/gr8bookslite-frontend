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
import { formatBankReconciliationAmount } from "@/app/src/data/modules/cash-receipt/bank-reconciliation/BankReconciliationData";
import type {
  BankReconciliationRecord,
  BankReconciliationStatus,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";
import {
  getColumnMetaClassName,
  joinClasses,
} from "@/app/src/ui/shared/module/module-table/utils";
import { BankReconciliationRecordActions } from "@/app/src/ui/modules/cash-receipt/bank-reconciliation/BankReconciliationRecordActions";

type BankReconciliationTableRowProps = {
  row: Row<BankReconciliationRecord>;
  onUpdateStatus: (
    record: BankReconciliationRecord,
    status: BankReconciliationStatus,
  ) => void;
};

export function BankReconciliationTableRow({
  row,
  onUpdateStatus,
}: BankReconciliationTableRowProps) {
  const record = row.original;

  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <BankReconciliationTableCell
          key={cell.id}
          className={getColumnMetaClassName(cell.column.columnDef.meta)}
        >
          <BankReconciliationCellContent
            columnId={cell.column.id}
            record={record}
            onUpdateStatus={onUpdateStatus}
          />
        </BankReconciliationTableCell>
      ))}
    </tr>
  );
}

function BankReconciliationCellContent({
  columnId,
  onUpdateStatus,
  record,
}: {
  columnId: string;
  onUpdateStatus: (
    record: BankReconciliationRecord,
    status: BankReconciliationStatus,
  ) => void;
  record: BankReconciliationRecord;
}) {
  switch (columnId) {
    case "brNo":
      return <span className="font-semibold">{record.brNo}</span>;
    case "endingDate":
      return (
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-skyblue" aria-hidden="true" />
          {record.endingDate}
        </span>
      );
    case "bankName":
      return (
        <>
          <div className="font-medium">{record.bankName}</div>
          <div className="text-xs text-darknavy/55">{record.currency}</div>
        </>
      );
    case "accountCode":
      return (
        <>
          <div className="font-medium">{record.accountCode}</div>
          <div className="text-xs text-darknavy/55">{record.accountTitle}</div>
        </>
      );
    case "bankBalance":
      return (
        <span className="font-medium tabular-nums">
          {formatBankReconciliationAmount(record.bankBalance)}
        </span>
      );
    case "bookBalance":
      return (
        <span className="font-medium tabular-nums">
          {formatBankReconciliationAmount(record.bookBalance)}
        </span>
      );
    case "variance":
      return (
        <span
          className={joinClasses(
            "font-semibold tabular-nums",
            record.variance === 0 ? "text-emerald-700" : "text-coralpink",
          )}
        >
          {formatBankReconciliationAmount(record.variance)}
        </span>
      );
    case "status":
      return <BankReconciliationStatusBadge status={record.status} />;
    case "actions":
      return (
        <BankReconciliationRecordActions
          record={record}
          onUpdateStatus={onUpdateStatus}
        />
      );
    default:
      return null;
  }
}

function BankReconciliationTableCell({
  className = "text-left",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <td
      className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}
    >
      {children}
    </td>
  );
}

export function BankReconciliationStatusBadge({
  status,
}: {
  status: BankReconciliationStatus;
}) {
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
  Open: Clock3,
  Posted: PackageCheck,
} satisfies Record<BankReconciliationStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  "For Approval": "bg-citron/25 text-darknavy",
  Open: "bg-skyblue/20 text-darknavy",
  Posted: "bg-emerald-100 text-emerald-800",
} satisfies Record<BankReconciliationStatus, string>;
