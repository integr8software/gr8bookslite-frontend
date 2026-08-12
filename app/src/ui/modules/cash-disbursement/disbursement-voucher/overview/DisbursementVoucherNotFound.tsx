import { SearchX } from "lucide-react";
import {
  DisbursementVoucherHref,
  DisbursementVoucherNotFoundCopy,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function DisbursementVoucherNotFound() {
  return (
    <ModuleNotFound
      align="center"
      actionHref={DisbursementVoucherHref}
      actionLabel={DisbursementVoucherNotFoundCopy.actionLabel}
      className="rounded-[28px] p-8 shadow-[0_24px_60px_rgba(33,39,56,0.08)]"
      description={DisbursementVoucherNotFoundCopy.description}
      icon={<SearchX className="h-7 w-7" aria-hidden="true" />}
      iconClassName="h-16 w-16 rounded-full bg-coralpink/12 text-coralpink"
      title={DisbursementVoucherNotFoundCopy.title}
      titleClassName="mt-5 text-3xl font-semibold text-darknavy"
      descriptionClassName="mt-3 text-sm leading-6 text-darknavy/60"
    />
  );
}
