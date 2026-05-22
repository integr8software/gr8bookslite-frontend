import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { PettyCashReplenishmentHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import type { PettyCashReplenishmentRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

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

type PettyCashReplenishmentTableRowProps = {
  onDelete: (row: PettyCashReplenishmentRecord) => void;
  row: PettyCashReplenishmentRecord;
};

export function PettyCashReplenishmentTableRow({
  onDelete,
  row,
}: PettyCashReplenishmentTableRowProps) {
  return (
    <tr className="module-table-row text-darknavy">
      <td className="px-4 py-3 text-sm font-semibold text-darknavy/80">
        {row.replenishmentNo}
      </td>
      <td className={tableCellClassName}>{row.vceCode}</td>
      <td className={tableCellClassName}>{row.vceName}</td>
      <td className={tableCellClassName}>{row.documentDate}</td>
      <td className={tableCellClassName}>{row.totalAmount}</td>
      <td className={tableCellClassName}>
        <PettyCashReplenishmentStatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`${PettyCashReplenishmentHref}/view/${row.id}`}
            aria-label={`View ${row.replenishmentNo}`}
            className={rowActionClassName}
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`${PettyCashReplenishmentHref}/edit/${row.id}`}
            aria-label={`Edit ${row.replenishmentNo}`}
            className={rowActionClassName}
          >
            <Edit3 className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(row)}
            aria-label={`Delete ${row.replenishmentNo}`}
            className={deleteActionClassName}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PettyCashReplenishmentStatusBadge({
  status,
}: Pick<PettyCashReplenishmentRecord, "status">) {
  const toneClassName =
    status === "Active"
      ? "bg-skyblue/10 text-skyblue"
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
