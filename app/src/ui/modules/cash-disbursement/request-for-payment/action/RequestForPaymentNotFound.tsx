import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RequestForPaymentLink } from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function RequestForPaymentNotFound() {
  return (
    <section className="grid gap-4 rounded-lg border border-darknavy/10 bg-white p-5">
      <h1 className="text-xl font-semibold text-darknavy">Request for Payment not found</h1>
      <p className="text-sm text-darknavy/60">The requested payment request record is unavailable.</p>
      <Link href={RequestForPaymentLink} className={`${moduleHeaderActionClassNames.secondary} w-fit`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
    </section>
  );
}
