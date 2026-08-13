import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BillingInvoiceFormPage } from "@/app/src/ui/modules/sales/billing-invoice/form/BillingInvoiceFormPage";

const PageTitle = "View Billing Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingInvoiceViewPage() {
  return <BillingInvoiceFormPage />;
}


