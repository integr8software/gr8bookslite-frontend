import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesInvoiceFormPage } from "@/app/src/ui/modules/sales/sales-invoice/action/SalesInvoiceFormPage";

const PageTitle = "View Sales Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesInvoiceViewPage() {
  return <SalesInvoiceFormPage />;
}


