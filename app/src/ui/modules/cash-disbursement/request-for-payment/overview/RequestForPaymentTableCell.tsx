import type { ReactNode } from "react";
import type { RequestForPaymentRecord } from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { joinClasses, moduleAccentClassNames } from "@/app/src/ui/shared/module/module-table/utils";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function renderRequestForPaymentTableCell(
  columnId: string,
  record: RequestForPaymentRecord,
  renderActions: () => ReactNode,
) {
  if (columnId === "transactionNo") {
    return <span className={joinClasses("font-semibold", moduleAccentClassNames.iconText)}>{record.transactionNo}</span>;
  }
  if (columnId === "amount") {
    return <span className="font-semibold tabular-nums">{formatCurrency(record.amount)}</span>;
  }
  if (
    columnId === "documentDate" ||
    columnId === "dateNeeded" ||
    columnId === "createdAt" ||
    columnId === "updatedAt"
  ) {
    const val = record[columnId as "documentDate" | "dateNeeded" | "createdAt" | "updatedAt"];
    return formatDate(val, { emptyValue: "" });
  }
  if (columnId === "status") {
    return (
      <div className="flex w-full justify-center">
        <ModuleStatusBadge status={record.status} />
      </div>
    );
  }
  if (columnId === "actions") {
    return renderActions();
  }
  return undefined;
}
