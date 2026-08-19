import type { ReactNode } from "react";
import { formatCurrency, formatDateLabel, getDisbursementVoucherDisplayStatus } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

export function renderDisbursementVoucherTableCell(
  columnId: string,
  row: DisbursementVoucherPreviewRow,
  renderActions: () => ReactNode,
) {
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
      return row.voucher?.disbursementType || row.transaction.disbursementType || row.voucher?.paymentMethod || row.transaction.paymentMethod;
    case "remarks":
      return <span className="line-clamp-2 text-sm text-darknavy/80">{row.voucher?.remarks || row.transaction.purpose || ""}</span>;
    case "currency":
      return row.voucher?.currency ?? row.transaction.currency;
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCurrency(row.voucher?.amount ?? row.transaction.amount)}</span>;
    case "status":
      return <div className="flex w-full justify-center"><ModuleStatusBadge status={getDisbursementVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status)} /></div>;
    case "createdBy":
      return row.voucher?.createdBy ?? row.transaction.createdBy ?? "";
    case "createdAt":
      return formatAuditDate(row.voucher?.createdAt ?? row.transaction.createdAt ?? "");
    case "updatedBy":
      return row.voucher?.updatedBy ?? row.transaction.updatedBy ?? "";
    case "updatedAt":
      return formatAuditDate(row.voucher?.updatedAt ?? row.transaction.updatedAt ?? "");
    case "actions":
      return renderActions();
    default:
      return null;
  }
}

function formatAuditDate(value: string) {
  return value ? formatDateLabel(value) : "";
}
