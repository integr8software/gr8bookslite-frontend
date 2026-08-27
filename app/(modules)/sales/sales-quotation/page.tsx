import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesQuotationOverviewPage } from "@/app/src/ui/modules/sales/sales-quotation/overview/SalesQuotationOverviewPage";

const PageTitle = "Sales Quotation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesQuotationPage() {
  return <SalesQuotationOverviewPage />;
}
