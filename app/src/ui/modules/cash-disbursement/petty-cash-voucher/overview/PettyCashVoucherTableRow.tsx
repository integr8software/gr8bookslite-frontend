import { flexRender } from "@tanstack/react-table";
import { PettyCashVoucherTableCellClassName } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherRecord,
  PettyCashVoucherTableRowProps,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";
import { PettyCashVoucherRecordActions } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/overview/PettyCashVoucherRecordActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { getColumnMetaClassName, joinClasses, moduleAccentClassNames } from "@/app/src/ui/shared/module/module-table/utils";

export function PettyCashVoucherTableRow({ onUpdateStatus, row }: PettyCashVoucherTableRowProps) {
  const record = row.original;

  return (
    <tr className="module-table-row border-b border-darknavy/8 text-darknavy last:border-b-0">
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className={joinClasses(PettyCashVoucherTableCellClassName, getColumnMetaClassName(cell.column.columnDef.meta))}>
          {renderPettyCashVoucherCell(cell.column.id, record, onUpdateStatus) ?? flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

function renderPettyCashVoucherCell(
  columnId: string,
  row: PettyCashVoucherRecord,
  onUpdateStatus: PettyCashVoucherTableRowProps["onUpdateStatus"],
) {
  if (columnId === "voucherNo") {
    return <span className={joinClasses("font-semibold", moduleAccentClassNames.iconText)}>{row.voucherNo}</span>;
  }

  if (columnId === "amount") {
    return <span className="font-semibold tabular-nums">{formatCurrency(row.amount)}</span>;
  }

  if (columnId === "documentDate") {
    return formatDate(row.documentDate, { emptyValue: "" });
  }

  if (columnId === "dateCreated") {
    return formatDate(row.dateCreated, { emptyValue: "" });
  }

  if (columnId === "dateModified") {
    return formatDate(row.dateModified, { emptyValue: "" });
  }

  if (columnId === "status") {
    return (
      <span className="inline-flex w-full justify-center">
        <ModuleStatusBadge status={row.status} />
      </span>
    );
  }

  if (columnId === "actions") {
    return <PettyCashVoucherRecordActions record={row} onUpdateStatus={onUpdateStatus} />;
  }

  return null;
}
