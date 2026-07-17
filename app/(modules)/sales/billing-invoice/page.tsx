import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BillingInvoiceListPage } from "@/app/src/ui/modules/sales/billing-invoice/BillingInvoiceListPage";

const PageTitle = "Billing Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingInvoicePage() {
  return <BillingInvoiceListPage />;
}


