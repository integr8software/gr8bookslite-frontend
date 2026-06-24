import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesInvoiceMain } from "@/app/src/ui/modules/sales/sales-invoice/Main";

const PageTitle = "Sales Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesInvoicePage() {
  return <SalesInvoiceMain />;
}


