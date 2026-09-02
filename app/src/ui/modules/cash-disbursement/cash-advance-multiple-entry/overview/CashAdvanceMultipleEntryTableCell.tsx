import type { ReactNode } from "react";
import { formatCashAdvanceCurrency } from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import type { CashAdvanceMultipleEntryRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { formatDate } from "@/app/src/utils/date.util";

export function renderCashAdvanceMultipleEntryTableCell(
  columnId: string,
  record: CashAdvanceMultipleEntryRecord,
  renderActions: () => ReactNode,
) {
  switch (columnId) {
    case "transNo":
      return <span className="font-semibold text-skyblue">{record.transNo}</span>;
    case "documentDate":
      return formatDate(record.documentDate);
    case "partyName":
      return record.partyName;
    case "partyCode":
      return record.partyCode;
    case "accountCode":
      return record.accountCode || "";
    case "accountTitle":
      return record.accountTitle || "";
    case "currency":
      return record.currency ?? record.formValues?.currency ?? "PHP";
    case "exchangeRate":
      return record.exchangeRate ?? record.formValues?.exchangeRate ?? "1.00";
    case "remarks":
      return <span className="line-clamp-2 text-sm text-darknavy/80">{record.remarks || ""}</span>;
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCashAdvanceCurrency(record.amount)}</span>;
    case "createdBy":
      return record.createdBy ?? "";
    case "createdAt":
      return formatDate(record.createdAt);
    case "updatedBy":
      return record.updatedBy ?? "";
    case "updatedAt":
      return formatDate(record.updatedAt);
    case "status":
      return <div className="flex w-full justify-center"><ModuleStatusBadge status={record.status} /></div>;
    case "actions":
      return renderActions();
    default:
      return null;
  }
}
