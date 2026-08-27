import Link from "next/link";
import { CreditMemoHref } from "@/app/src/constants/modules/general-journal/credit-memo/CreditMemoConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function CreditMemoNotFound() {
  return (
    <section className="grid min-h-[22rem] place-items-center rounded-md border border-darknavy/10 bg-white p-8 text-center shadow-sm shadow-darknavy/5">
      <div className="grid gap-3">
        <h1 className="text-xl font-bold text-darknavy">Credit Memo not found</h1>
        <p className="text-sm font-medium text-darknavy/60">
          The selected Credit Memo may have been removed from this frontend session.
        </p>
        <Link href={CreditMemoHref} className={moduleHeaderActionClassNames.primary}>
          Back to Credit Memo
        </Link>
      </div>
    </section>
  );
}
