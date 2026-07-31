import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  PackageCheck,
  ThumbsDown,
  Undo2,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";
import {
  AccountsPayableVoucherHref,
  canApproveAccountsPayableVoucherStatus,
  canCancelAccountsPayableVoucherStatus,
  canDisapproveAccountsPayableVoucherStatus,
  canEditAccountsPayableVoucherStatus,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { formatAccountsPayableVoucherAmount } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import type {
  AccountsPayableVoucherRecord,
  AccountsPayableVoucherStatus,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import {
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  getColumnMetaClassName,
  joinClasses,
} from "@/app/src/ui/shared/module/module-table/utils";

type AccountsPayableVoucherTableRowProps = {
  row: Row<AccountsPayableVoucherRecord>;
  onUpdateStatus: (
    record: AccountsPayableVoucherRecord,
    status: AccountsPayableVoucherStatus,
  ) => void;
};

export function AccountsPayableVoucherTableRow({
  row,
  onUpdateStatus,
}: AccountsPayableVoucherTableRowProps) {
  const record = row.original;
  const isApproved = record.status === "Approved";
  const isDisapproved = record.status === "Disapproved";
  const isCancelled = record.status === "Cancelled";
  const approvalUndoStatus: AccountsPayableVoucherStatus = "Draft";
  const cancelStatus: AccountsPayableVoucherStatus = isCancelled
    ? "Draft"
    : "Cancelled";
  const actionItems: ModuleActionMenuItem[] = [
    {
      href: `${AccountsPayableVoucherHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditAccountsPayableVoucherStatus(record.status)
      ? [
          {
            href: `${AccountsPayableVoucherHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !canApproveAccountsPayableVoucherStatus(record.status),
      icon: isApproved ? Undo2 : CheckCircle2,
      label: isApproved ? "Undo Approved" : "Approve",
      onSelect: () =>
        onUpdateStatus(record, isApproved ? approvalUndoStatus : "Approved"),
      type: "button",
    },
    {
      disabled: !canDisapproveAccountsPayableVoucherStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () =>
        onUpdateStatus(
          record,
          isDisapproved ? approvalUndoStatus : "Disapproved",
        ),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelAccountsPayableVoucherStatus(record.status),
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
        <AccountsPayableVoucherTableCell
          key={cell.id}
          className={getColumnMetaClassName(cell.column.columnDef.meta)}
        >
          <AccountsPayableVoucherCellContent
            actionItems={actionItems}
            columnId={cell.column.id}
            record={record}
          />
        </AccountsPayableVoucherTableCell>
      ))}
    </tr>
  );
}

function AccountsPayableVoucherCellContent({
  actionItems,
  columnId,
  record,
}: {
  actionItems: ModuleActionMenuItem[];
  columnId: string;
  record: AccountsPayableVoucherRecord;
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
          <div className="text-xs text-darknavy/55">
            {record.partyCode || "No party code"}
          </div>
        </>
      );
    case "amount":
      return (
        <span className="font-semibold tabular-nums">
          {formatAccountsPayableVoucherAmount(record.amount)}
        </span>
      );
    case "payableType":
      return <span>{record.payableType}</span>;
    case "currency":
      return (
        <>
          <div className="font-medium">{record.currency}</div>
          <div className="text-xs text-darknavy/55">
            Exchange Rate {formatAccountsPayableVoucherAmount(record.exchangeRate)}
          </div>
        </>
      );
    case "status":
      return <AccountsPayableVoucherStatusBadge status={record.status} />;
    case "actions":
      return (
        <ModuleTableActions className="w-full !justify-center">
          <ModuleActionMenu
            items={actionItems}
            label={`Actions for accounts payable voucher ${record.transactionNo}`}
          />
        </ModuleTableActions>
      );
    default:
      return null;
  }
}

function AccountsPayableVoucherTableCell({
  className = "text-left",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <td className={`px-4 py-4 align-middle text-sm text-darknavy ${className}`}>
      {children}
    </td>
  );
}

function AccountsPayableVoucherStatusBadge({
  status,
}: {
  status: AccountsPayableVoucherStatus;
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
  Approved: CheckCircle2,
  Cancelled: Ban,
  Closed: PackageCheck,
  Disapproved: XCircle,
  Draft: Clock3,
} satisfies Record<AccountsPayableVoucherStatus, typeof CheckCircle2>;

const statusClassNameByStatus = {
  Approved: "bg-citron/25 text-darknavy",
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Closed: "bg-skyblue/20 text-darknavy",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
} satisfies Record<AccountsPayableVoucherStatus, string>;
