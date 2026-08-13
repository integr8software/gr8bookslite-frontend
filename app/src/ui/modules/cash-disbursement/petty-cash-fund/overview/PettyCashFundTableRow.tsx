import { flexRender } from "@tanstack/react-table";
import type {
  PettyCashFundRecord,
  PettyCashFundTableRowProps,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";
import { PettyCashFundRecordActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/overview/PettyCashFundRecordActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName, joinClasses, moduleAccentClassNames } from "@/app/src/ui/shared/module/module-table/utils";

export function PettyCashFundTableRow({ onUpdateStatus, row }: PettyCashFundTableRowProps) {
  const record = row.original;
  return (
    <tr className="module-table-row border-b border-darknavy/8 text-darknavy last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={joinClasses("px-4 py-4 align-middle text-sm text-darknavy/70", getColumnMetaClassName(cell.column.columnDef.meta))}
        >
          {renderCell(cell.column.id, record, onUpdateStatus) ?? flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
function renderCell(columnId: string, record: PettyCashFundRecord, onUpdateStatus: PettyCashFundTableRowProps["onUpdateStatus"]) {
  if (columnId === "transactionNo")
    return <span className={joinClasses("font-semibold", moduleAccentClassNames.iconText)}>{record.transactionNo}</span>;
  if (columnId === "amount") return <span className="font-semibold tabular-nums">{formatCurrency(record.amount)}</span>;
  if (["documentDate", "createdAt", "updatedAt"].includes(columnId))
    return formatDate(record[columnId as "documentDate" | "createdAt" | "updatedAt"], { emptyValue: "" });
  if (columnId === "status")
    return (
      <span className="inline-flex w-full justify-center">
        <ModuleStatusBadge status={record.status} />
      </span>
    );
  if (columnId === "actions") return <PettyCashFundRecordActions record={record} onUpdateStatus={onUpdateStatus} />;
  return null;
}
