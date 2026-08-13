import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesInvoiceListPage } from "@/app/src/ui/modules/sales/sales-invoice/overview/SalesInvoiceListPage";

const PageTitle = "Sales Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesInvoicePage() {
  return <SalesInvoiceListPage />;
}


