import type { ReactNode } from "react";
import { CashAdvanceAccountOptions } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { formatCashAdvanceCurrency } from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import type { CashAdvanceRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { formatDate } from "@/app/src/utils/date.util";

export function renderCashAdvanceTableCell(
  columnId: string,
  record: CashAdvanceRecord,
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
      return <span className="text-darknavy">{getCashAdvanceAccountTitle(record.accountCode)}</span>;
    case "remarks":
      return <span className="line-clamp-2 text-sm text-darknavy/80">{record.remarks || ""}</span>;
    case "amount":
      return <span className="font-semibold text-darknavy">{formatCashAdvanceCurrency(record.amount)}</span>;
    case "currency":
      return record.formValues?.currency ?? "PHP";
    case "status":
      return <div className="flex w-full justify-center"><ModuleStatusBadge status={record.status} /></div>;
    case "createdBy":
      return record.createdBy ?? "";
    case "createdAt":
      return formatDate(record.createdAt);
    case "updatedBy":
      return record.updatedBy ?? "";
    case "updatedAt":
      return formatDate(record.updatedAt);
    case "actions":
      return renderActions();
    default:
      return null;
  }
}

function getCashAdvanceAccountTitle(accountCode: string) {
  return CashAdvanceAccountOptions.find((option) => option.value === accountCode)?.label ?? accountCode;
}
