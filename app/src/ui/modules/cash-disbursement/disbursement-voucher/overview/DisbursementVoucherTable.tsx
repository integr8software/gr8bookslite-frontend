import { Search } from "lucide-react";
import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";
import { DisbursementVoucherTablePaginationStorageKey } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import {
  formatCurrency,
  formatDateLabel,
  getDisbursementVoucherDisplayStatus,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherDisplayStatus } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type {
  DisbursementVoucherPreviewRow,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/overview/DisbursementVoucherRecordActions";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DisbursementVoucherTable({
  lastSyncedAt,
  table,
  toolbar,
  onUpdateStatus,
}: {
  lastSyncedAt?: number | string | Date | null;
  table: ReturnType<
    typeof import("@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher").useDisbursementVoucherPreviewTable
  >["table"];
  toolbar?: ReactNode;
  onUpdateStatus: (row: DisbursementVoucherPreviewRow, status: DisbursementVoucherStatus) => void;
}) {
  return (
    <ModuleTable
      emptyDescription="Try another voucher no., remarks, date range, amount range, or status."
      emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
      emptyTitle="No Disbursement Voucher Transaction Found."
      minWidthClassName="min-w-full"
      paginationLabel="entries"
      paginationStorageKey={DisbursementVoucherTablePaginationStorageKey}
      lastSyncedAt={lastSyncedAt}
      pageSizeOptions={[5, 10, 15, 20, 25, 50]}
      table={table}
      tableTitle="Disbursement Voucher Entries"
      toolbar={toolbar}
      useColumnSizing
      renderRow={(row) => <DisbursementVoucherTableRow key={row.id} row={row} onUpdateStatus={onUpdateStatus} />}
    />
  );
}

function DisbursementVoucherTableRow({
  row,
  onUpdateStatus,
}: {
  row: Row<DisbursementVoucherPreviewRow>;
  onUpdateStatus: (row: DisbursementVoucherPreviewRow, status: DisbursementVoucherStatus) => void;
}) {
  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className={joinClasses("px-4 py-4 align-middle", getColumnMetaClassName(cell.column.columnDef.meta))}>
          <DisbursementVoucherCellContent columnId={cell.column.id} row={row.original} onUpdateStatus={onUpdateStatus} />
        </td>
      ))}
    </tr>
  );
}

function DisbursementVoucherCellContent({
  columnId,
  row,
  onUpdateStatus,
}: {
  columnId: string;
  row: DisbursementVoucherPreviewRow;
  onUpdateStatus: (row: DisbursementVoucherPreviewRow, status: DisbursementVoucherStatus) => void;
}) {
  switch (columnId) {
    case "voucherNo":
      return <span className="font-semibold text-skyblue">{row.voucher?.voucherNo ?? row.transaction.transactionNo}</span>;
    case "documentDate":
      return formatDateLabel(row.voucher?.voucherDate ?? row.transaction.transactionDate);
    case "partyName":
      return row.voucher?.partyName || row.transaction.payee;
    case "partyCode":
      return row.voucher?.partyCode || "";
    case "paymentType":
      return getDisbursementVoucherPaymentType(row);
    case "remarks":
      return <span className="line-clamp-2 text-sm text-darknavy/80">{row.voucher?.remarks || row.transaction.purpose || ""}</span>;
    case "currency":
      return row.voucher?.currency ?? row.transaction.currency;
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCurrency(row.voucher?.amount ?? row.transaction.amount)}</span>;
    case "status":
      return (
        <div className="flex w-full justify-center">
          <DisbursementVoucherStatusBadge status={getDisbursementVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status)} />
        </div>
      );
    case "createdBy":
      return row.voucher?.createdBy ?? row.transaction.createdBy ?? "";
    case "createdAt":
      return formatAuditDate(row.voucher?.createdAt ?? row.transaction.createdAt ?? "");
    case "updatedBy":
      return row.voucher?.updatedBy ?? row.transaction.updatedBy ?? "";
    case "updatedAt":
      return formatAuditDate(row.voucher?.updatedAt ?? row.transaction.updatedAt ?? "");
    case "actions":
      return <DisbursementVoucherRecordActions row={row} onUpdateStatus={onUpdateStatus} />;
    default:
      return null;
  }
}

function getDisbursementVoucherPaymentType(row: DisbursementVoucherPreviewRow) {
  return row.voucher?.disbursementType || row.transaction.disbursementType || row.voucher?.paymentMethod || row.transaction.paymentMethod;
}

function DisbursementVoucherStatusBadge({ status }: { status: DisbursementVoucherDisplayStatus }) {
  return <ModuleStatusBadge status={status} />;
}

function formatAuditDate(value: string) {
  return value ? formatDateLabel(value) : "";
}
