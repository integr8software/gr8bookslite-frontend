import Link from "next/link";
import { Home, Plus, Repeat2 } from "lucide-react";
import { RecurringTransactionsHref } from "@/app/src/constants/modules/cash-disbursement/recurring-transactions/RecurringTransactionsConstants";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function RecurringTransactionsListPage() {
  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] text-darknavy sm:-mx-5 lg:-mx-6">
      <main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
        <ModuleHeader
          variant="panel"
          title="Recurring Transactions"
          titleAs="h1"
          description="Create and manage repeating cash disbursement transactions."
          eyebrow={
            <>
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Cash disbursement
            </>
          }
          actions={
            <Link
              href={`${RecurringTransactionsHref}/add`}
              className={moduleHeaderActionClassNames.primary}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Recurring Transaction
            </Link>
          }
        />

        <section className="rounded-lg border border-darknavy/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
            <Repeat2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-darknavy">
            No recurring transactions found
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-darknavy/55">
            Created recurring transaction schedules will appear here.
          </p>
        </section>
      </main>
    </section>
  );
}
