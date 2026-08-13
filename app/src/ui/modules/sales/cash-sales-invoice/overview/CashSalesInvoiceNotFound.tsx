import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CashSalesInvoiceHref } from "@/app/src/constants/modules/sales/cash-sales-invoice/CashSalesInvoiceConstants";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function CashSalesInvoiceNotFound() {
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Cash Sales Invoice Not Found"
        description="The selected cash sales invoice could not be found."
        actions={
          <Link href={CashSalesInvoiceHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to List
          </Link>
        }
      />
    </section>
  );
}
