import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesQuotationMain } from "@/app/src/ui/modules/sales/sales-quotation/Main";

const PageTitle = "Sales Quotation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesQuotationPage() {
  return <SalesQuotationMain />;
}


