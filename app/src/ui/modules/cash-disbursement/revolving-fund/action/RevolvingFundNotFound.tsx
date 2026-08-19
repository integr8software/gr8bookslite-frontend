import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RevolvingFundLink } from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
export function RevolvingFundNotFound() {
  return (
    <section className="grid gap-4 rounded-lg border border-darknavy/10 bg-white p-5">
      <h1 className="text-xl font-semibold text-darknavy">Revolving fund not found</h1>
      <p className="text-sm text-darknavy/60">The requested revolving fund record is unavailable.</p>
      <Link href={RevolvingFundLink} className={`${moduleHeaderActionClassNames.secondary} w-fit`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
    </section>
  );
}
