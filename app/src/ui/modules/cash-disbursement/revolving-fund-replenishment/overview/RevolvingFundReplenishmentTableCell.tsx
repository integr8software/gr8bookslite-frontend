import type { ReactNode } from "react";
import type { RevolvingFundReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { joinClasses, moduleAccentClassNames } from "@/app/src/ui/shared/module/module-table/utils";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function renderRevolvingFundReplenishmentTableCell(
  columnId: string,
  record: RevolvingFundReplenishmentRecord,
  renderActions: () => ReactNode,
) {
  if (columnId === "transactionNo") {
    return <span className={joinClasses("font-semibold", moduleAccentClassNames.iconText)}>{record.transactionNo}</span>;
  }
  if (columnId === "amount" || columnId === "disburseAmount") {
    return <span className="font-semibold tabular-nums">{formatCurrency(record[columnId])}</span>;
  }
  if (columnId === "documentDate" || columnId === "createdAt" || columnId === "updatedAt") {
    return formatDate(record[columnId], { emptyValue: "" });
  }
  if (columnId === "status") {
    return <div className="flex w-full justify-center"><ModuleStatusBadge status={record.status} /></div>;
  }
  if (columnId === "actions") return renderActions();
  return undefined;
}
