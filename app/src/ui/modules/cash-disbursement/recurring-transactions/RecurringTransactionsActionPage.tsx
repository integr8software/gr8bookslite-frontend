"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home, Save, X } from "lucide-react";
import { RecurringTransactionsHref } from "@/app/src/constants/modules/cash-disbursement/recurring-transactions/RecurringTransactionsConstants";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function RecurringTransactionsActionPage() {
  const pathname = usePathname();
  const mode = pathname.includes("/view/")
    ? "view"
    : pathname.includes("/edit/")
      ? "edit"
      : "add";
  const isReadonly = mode === "view";
  const action = mode === "view" ? "View" : mode === "edit" ? "Edit" : "Add";

  return (
    <section className="grid gap-5 text-darknavy">
      <ModuleHeader
        variant="panel"
        title={`${action} Recurring Transaction`}
        titleAs="h1"
        description="Set up a transaction that repeats on a defined schedule."
        eyebrow={
          <>
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Cash disbursement
          </>
        }
        actions={
          <>
            <Link
              href={RecurringTransactionsHref}
              className={moduleHeaderActionClassNames.secondary}
            >
              {isReadonly ? (
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              ) : (
                <X className="h-4 w-4" aria-hidden="true" />
              )}
              {isReadonly ? "Back" : "Cancel"}
            </Link>
            {isReadonly ? null : (
              <button
                type="submit"
                form="recurring-transaction-form"
                className={moduleHeaderActionClassNames.primary}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            )}
          </>
        }
      />

      <form
        id="recurring-transaction-form"
        className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm"
        onSubmit={(event) => event.preventDefault()}
      >
        <p className="text-sm text-darknavy/55">
          Recurring transaction setup fields will be configured here.
        </p>
      </form>
    </section>
  );
}
