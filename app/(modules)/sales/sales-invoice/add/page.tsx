import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { SalesInvoiceAction } from "@/app/src/ui/modules/sales/sales-invoice/Action";

const PageTitle = "Add Sales Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesSalesInvoiceAddPage() {
  return <SalesInvoiceAction />;
}


