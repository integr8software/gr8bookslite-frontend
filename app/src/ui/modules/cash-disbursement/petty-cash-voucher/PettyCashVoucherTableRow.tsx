import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { PettyCashVoucherHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type { PettyCashVoucherRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

const rowActionClassName = [
  "inline-flex h-9 items-center justify-center rounded-lg border",
  "border-darknavy/10 bg-white px-3 text-sm font-semibold",
  "text-darknavy/80 transition hover:bg-skyblue/10",
].join(" ");

const deleteActionClassName = [
  "inline-flex h-9 items-center justify-center rounded-lg border",
  "border-red-200 bg-white px-3 text-sm font-semibold text-red-600",
  "transition hover:bg-red-50",
].join(" ");

const tableCellClassName = "px-4 py-3 text-sm text-darknavy/70";

type PettyCashVoucherTableRowProps = {
  onDelete: (row: PettyCashVoucherRecord) => void;
  row: PettyCashVoucherRecord;
};

export function PettyCashVoucherTableRow({
  onDelete,
  row,
}: PettyCashVoucherTableRowProps) {
  return (
    <tr className="module-table-row text-darknavy">
      <td className="px-4 py-3 text-sm font-semibold text-darknavy/80">
        {row.voucherNo}
      </td>
      <td className={tableCellClassName}>{row.vceCode}</td>
      <td className={tableCellClassName}>{row.vceName}</td>
      <td className={tableCellClassName}>{row.accountCode}</td>
      <td className={tableCellClassName}>{row.amount}</td>
      <td className={tableCellClassName}>{row.documentDate}</td>
      <td className={tableCellClassName}>
        <PettyCashVoucherStatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`${PettyCashVoucherHref}/view/${row.id}`}
            aria-label={`View ${row.voucherNo}`}
            className={rowActionClassName}
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`${PettyCashVoucherHref}/edit/${row.id}`}
            aria-label={`Edit ${row.voucherNo}`}
            className={rowActionClassName}
          >
            <Edit3 className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(row)}
            aria-label={`Delete ${row.voucherNo}`}
            className={deleteActionClassName}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PettyCashVoucherStatusBadge({
  status,
}: Pick<PettyCashVoucherRecord, "status">) {
  const toneClassName =
    status === "Approved"
      ? "bg-green-100 text-green-700"
      : status === "Pending"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return (
    <span
      className={[
        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
        toneClassName,
      ].join(" ")}
    >
      {status}
    </span>
  );
}
