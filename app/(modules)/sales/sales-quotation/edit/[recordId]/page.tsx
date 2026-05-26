import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { SalesQuotationAction } from "@/app/src/ui/modules/sales/sales-quotation/Action";

const PageTitle = "Edit Sales Quotation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesQuotationEditPage() {
  return <SalesQuotationAction />;
}


