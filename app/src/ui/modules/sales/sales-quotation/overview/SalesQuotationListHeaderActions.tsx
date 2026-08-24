import Link from "next/link";
import { Plus } from "lucide-react";
import { SalesQuotationHref } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function SalesQuotationListHeaderActions() {
  return (
    <Link href={`${SalesQuotationHref}/add`} className={moduleHeaderActionClassNames.primary}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      New Sales Quotation
    </Link>
  );
}
