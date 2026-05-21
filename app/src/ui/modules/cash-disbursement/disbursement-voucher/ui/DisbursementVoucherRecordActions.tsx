import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export function DisbursementVoucherRecordActions({
  row,
  onDeleteVoucher,
}: {
  row: DisbursementVoucherPreviewRow;
  onDeleteVoucher: (row: DisbursementVoucherPreviewRow) => void;
}) {
  const transactionId = row.transaction.id;

  return (
    <div className="flex items-center justify-end gap-1">
      <IconLink
        href={`${DisbursementVoucherHref}/view/${transactionId}`}
        label={`Preview ${row.transaction.payee}`}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
      </IconLink>
      {row.voucher ? (
        <>
          <IconLink
            href={`${DisbursementVoucherHref}/edit/${transactionId}`}
            label={`Edit voucher for ${row.transaction.payee}`}
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
          </IconLink>
          <button
            type="button"
            onClick={() => onDeleteVoucher(row)}
            aria-label={`Delete voucher for ${row.transaction.payee}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-coralpink transition hover:bg-coralpink/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

function IconLink({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-darknavy/65 transition hover:bg-darknavy/6 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30"
    >
      {children}
    </Link>
  );
}
