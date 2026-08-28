import Link from "next/link";
import { BankReconciliationHref } from "@/app/src/constants/modules/cash-receipt/bank-reconciliation/BankReconciliationConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function BankReconciliationNotFound() {
  return (
    <section className="grid min-h-[22rem] place-items-center rounded-md border border-darknavy/10 bg-white p-8 text-center shadow-sm shadow-darknavy/5">
      <div className="grid gap-3">
        <h1 className="text-xl font-bold text-darknavy">
          Bank Reconciliation not found
        </h1>
        <p className="text-sm font-medium text-darknavy/60">
          The selected Bank Reconciliation record may have been removed or does not exist.
        </p>
        <Link
          href={BankReconciliationHref}
          className={moduleHeaderActionClassNames.primary}
        >
          Back to Bank Reconciliation
        </Link>
      </div>
    </section>
  );
}
