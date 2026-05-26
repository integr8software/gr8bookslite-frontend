import { PettyCashVoucherHref } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type { PettyCashVoucherRecord } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

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
        <ModuleTableActions>
          <ModuleTableActionLink
            variant="view"
            href={`${PettyCashVoucherHref}/view/${row.id}`}
            label={`View ${row.voucherNo}`}
          />
          <ModuleTableActionLink
            variant="edit"
            href={`${PettyCashVoucherHref}/edit/${row.id}`}
            label={`Edit ${row.voucherNo}`}
          />
          <ModuleTableActionButton
            variant="delete"
            onClick={() => onDelete(row)}
            label={`Delete ${row.voucherNo}`}
          />
        </ModuleTableActions>
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
