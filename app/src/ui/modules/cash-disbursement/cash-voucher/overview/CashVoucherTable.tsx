import { Search } from "lucide-react";
import type { ReactNode } from "react";
import type { Row } from "@tanstack/react-table";
import { CashVoucherTablePaginationStorageKey } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import {
  formatCurrency,
  formatDateLabel,
  getCashVoucherDisplayStatus,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type { CashVoucherDisplayStatus } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import type {
  CashVoucherPreviewRow,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { CashVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/overview/CashVoucherRecordActions";
import { getColumnMetaClassName, joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function CashVoucherTable({
  lastSyncedAt,
  table,
  toolbar,
  onUpdateStatus,
}: {
  lastSyncedAt?: number | string | Date | null;
  table: ReturnType<
    typeof import("@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucher").useCashVoucherPreviewTable
  >["table"];
  toolbar?: ReactNode;
  onUpdateStatus: (row: CashVoucherPreviewRow, status: CashVoucherStatus) => void;
}) {
  return (
    <ModuleTable
      emptyDescription="Try another voucher no., remarks, date range, amount range, or status."
      emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
      emptyTitle="No Cash Voucher Transaction Found."
      minWidthClassName="min-w-full"
      paginationLabel="entries"
      paginationStorageKey={CashVoucherTablePaginationStorageKey}
      lastSyncedAt={lastSyncedAt}
      pageSizeOptions={[5, 10, 15, 20, 25, 50]}
      table={table}
      tableTitle="Cash Voucher Entries"
      toolbar={toolbar}
      useColumnSizing
      renderRow={(row) => <CashVoucherTableRow key={row.id} row={row} onUpdateStatus={onUpdateStatus} />}
    />
  );
}

function CashVoucherTableRow({
  row,
  onUpdateStatus,
}: {
  row: Row<CashVoucherPreviewRow>;
  onUpdateStatus: (row: CashVoucherPreviewRow, status: CashVoucherStatus) => void;
}) {
  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className={joinClasses("px-4 py-4 align-middle", getColumnMetaClassName(cell.column.columnDef.meta))}>
          <CashVoucherCellContent columnId={cell.column.id} row={row.original} onUpdateStatus={onUpdateStatus} />
        </td>
      ))}
    </tr>
  );
}

function CashVoucherCellContent({
  columnId,
  row,
  onUpdateStatus,
}: {
  columnId: string;
  row: CashVoucherPreviewRow;
  onUpdateStatus: (row: CashVoucherPreviewRow, status: CashVoucherStatus) => void;
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
    case "remarks":
      return <span className="line-clamp-2 text-sm text-darknavy/80">{row.voucher?.remarks || row.transaction.purpose || ""}</span>;
    case "currency":
      return row.voucher?.currency ?? row.transaction.currency;
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCurrency(row.voucher?.amount ?? row.transaction.amount)}</span>;
    case "status":
      return (
        <div className="flex w-full justify-center">
          <CashVoucherStatusBadge status={getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status)} />
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
      return <CashVoucherRecordActions row={row} onUpdateStatus={onUpdateStatus} />;
    default:
      return null;
  }
}

function CashVoucherStatusBadge({ status }: { status: CashVoucherDisplayStatus }) {
  return <ModuleStatusBadge status={status} />;
}

function formatAuditDate(value: string) {
  return value ? formatDateLabel(value) : "";
}


