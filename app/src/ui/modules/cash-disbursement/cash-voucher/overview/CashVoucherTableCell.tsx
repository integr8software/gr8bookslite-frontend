import type { ReactNode } from "react";
import { formatCurrency, getCashVoucherDisplayStatus } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type { CashVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { formatDate } from "@/app/src/utils/date.util";

export function renderCashVoucherTableCell(
  columnId: string,
  row: CashVoucherPreviewRow,
  renderActions: () => ReactNode,
) {
  switch (columnId) {
    case "voucherNo":
      return <span className="font-semibold text-skyblue">{row.voucher?.voucherNo ?? row.transaction.transactionNo}</span>;
    case "documentDate":
      return formatDate(row.voucher?.voucherDate ?? row.transaction.transactionDate);
    case "partyName":
      return row.voucher?.partyName || row.transaction.payee;
    case "partyCode":
      return row.voucher?.partyCode || "";
    case "remarks":
      return <span className="line-clamp-2 text-sm text-darknavy/80">{row.voucher?.remarks || row.transaction.purpose || ""}</span>;
    case "currency":
      return row.voucher?.currency ?? row.transaction.currency;
    case "exchangeRate":
      return row.voucher?.fxRate ?? row.transaction.fxRate ?? "";
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCurrency(row.voucher?.amount ?? row.transaction.amount)}</span>;
    case "status":
      return <div className="flex w-full justify-center"><ModuleStatusBadge status={getCashVoucherDisplayStatus(row.voucher?.status ?? row.transaction.status)} /></div>;
    case "createdBy":
      return row.voucher?.createdBy ?? row.transaction.createdBy ?? "";
    case "createdAt":
      return formatDate(row.voucher?.createdAt ?? row.transaction.createdAt);
    case "updatedBy":
      return row.voucher?.updatedBy ?? row.transaction.updatedBy ?? "";
    case "updatedAt":
      return formatDate(row.voucher?.updatedAt ?? row.transaction.updatedAt);
    case "actions":
      return renderActions();
    default:
      return null;
  }
}
