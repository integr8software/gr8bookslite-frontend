import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesQuotationActionPage } from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationActionPage";

const PageTitle = "Add Sales Quotation";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesQuotationAddPage() {
  return <SalesQuotationActionPage />;
}
