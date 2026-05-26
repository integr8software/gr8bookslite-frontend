import { SearchX } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function DisbursementVoucherNotFound() {
  return (
    <ModuleNotFound
      align="center"
      actionHref={DisbursementVoucherHref}
      actionLabel="Return to Disbursement Vouchers"
      className="rounded-[28px] p-8 shadow-[0_24px_60px_rgba(33,39,56,0.08)]"
      description="The selected transaction is no longer available in the mock disbursement store, or the voucher link is no longer valid."
      icon={<SearchX className="h-7 w-7" aria-hidden="true" />}
      iconClassName="h-16 w-16 rounded-full bg-coralpink/12 text-coralpink"
      title="Disbursement record not found"
      titleClassName="mt-5 text-3xl font-semibold text-darknavy"
      descriptionClassName="mt-3 text-sm leading-6 text-darknavy/60"
    />
  );
}
