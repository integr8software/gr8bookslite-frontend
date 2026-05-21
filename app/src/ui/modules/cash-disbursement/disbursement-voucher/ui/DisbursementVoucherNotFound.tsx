import Link from "next/link";
import { SearchX } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";

export function DisbursementVoucherNotFound() {
  return (
    <section className="rounded-[28px] border border-darknavy/10 bg-white p-8 text-center shadow-[0_24px_60px_rgba(33,39,56,0.08)]">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-coralpink/12 text-coralpink">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-3xl font-semibold text-darknavy">
        Disbursement record not found
      </h2>
      <p className="mt-3 text-sm leading-6 text-darknavy/60">
        The selected transaction is no longer available in the mock disbursement
        store, or the voucher link is no longer valid.
      </p>
      <Link
        href={DisbursementVoucherHref}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-darknavy px-5 text-sm font-semibold text-white"
      >
        Return to Disbursement Vouchers
      </Link>
    </section>
  );
}
