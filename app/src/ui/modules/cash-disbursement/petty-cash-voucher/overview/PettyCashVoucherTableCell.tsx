import type { ReactNode } from "react";
import type { PettyCashVoucherRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { joinClasses, moduleAccentClassNames } from "@/app/src/ui/shared/module/module-table/utils";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function renderPettyCashVoucherTableCell(
  columnId: string,
  record: PettyCashVoucherRecord,
  renderActions: () => ReactNode,
) {
  if (columnId === "voucherNo") {
    return <span className={joinClasses("font-semibold", moduleAccentClassNames.iconText)}>{record.voucherNo}</span>;
  }
  if (columnId === "amount" || columnId === "disburseAmount") {
    return <span className="font-semibold tabular-nums">{formatCurrency(record[columnId])}</span>;
  }
  if (columnId === "currency") return record.currency ?? "PHP";
  if (columnId === "exchangeRate") return record.exchangeRate ?? "1.00";
  if (columnId === "documentDate") return formatDate(record.documentDate, { emptyValue: "" });
  if (columnId === "dateCreated") return formatDate(record.dateCreated, { emptyValue: "" });
  if (columnId === "dateModified") return formatDate(record.dateModified, { emptyValue: "" });
  if (columnId === "status") {
    return <span className="inline-flex w-full justify-center"><ModuleStatusBadge status={record.status} /></span>;
  }
  if (columnId === "actions") return renderActions();
  return null;
}
