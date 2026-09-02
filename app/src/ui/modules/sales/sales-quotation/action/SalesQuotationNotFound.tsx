import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SalesQuotationHref } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function SalesQuotationNotFound() {
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Sales Quotation Not Found"
        description="The selected sales quotation could not be found."
        actions={
          <Link href={SalesQuotationHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to List
          </Link>
        }
      />
    </section>
  );
}
