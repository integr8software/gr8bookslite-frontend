import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PettyCashFundLink } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
export function PettyCashFundNotFound() {
  return (
    <section className="grid gap-4 rounded-lg border border-darknavy/10 bg-white p-5">
      <h1 className="text-xl font-semibold text-darknavy">Petty cash fund not found</h1>
      <p className="text-sm text-darknavy/60">The requested petty cash fund record is unavailable.</p>
      <Link href={PettyCashFundLink} className={`${moduleHeaderActionClassNames.secondary} w-fit`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
    </section>
  );
}
