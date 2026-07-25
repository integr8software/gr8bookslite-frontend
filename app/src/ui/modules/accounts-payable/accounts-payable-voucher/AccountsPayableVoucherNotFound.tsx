import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { AccountsPayableVoucherHref } from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function AccountsPayableVoucherNotFound() {
  return (
    <section className="grid min-h-[22rem] place-items-center rounded-md border border-darknavy/10 bg-white p-8 text-center shadow-sm shadow-darknavy/5">
      <div className="max-w-md">
        <FileQuestion
          className="mx-auto h-12 w-12 text-skyblue"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl font-semibold text-darknavy">
          Accounts payable voucher not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-darknavy/65">
          The selected accounts payable voucher may have been deleted or is no
          longer available.
        </p>
        <Link
          href={AccountsPayableVoucherHref}
          className={`${moduleHeaderActionClassNames.primary} mt-5`}
        >
          Back to Accounts Payable Voucher
        </Link>
      </div>
    </section>
  );
}
