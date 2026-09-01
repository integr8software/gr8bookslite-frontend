import Link from "next/link";
import { DebitMemoHref } from "@/app/src/constants/modules/general-journal/debit-memo/DebitMemoConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function DebitMemoNotFound() {
  return (
    <section className="grid min-h-[22rem] place-items-center rounded-md border border-darknavy/10 bg-white p-8 text-center shadow-sm shadow-darknavy/5">
      <div className="grid gap-3">
        <h1 className="text-xl font-bold text-darknavy">Debit Memo not found</h1>
        <p className="text-sm font-medium text-darknavy/60">
          The selected Debit Memo may have been removed from this frontend session.
        </p>
        <Link href={DebitMemoHref} className={moduleHeaderActionClassNames.primary}>
          Back to Debit Memo
        </Link>
      </div>
    </section>
  );
}
