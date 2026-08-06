import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BillingInvoiceActionPage } from "@/app/src/ui/modules/sales/billing-invoice/action/BillingInvoiceActionPage";

const PageTitle = "Edit Billing Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingInvoiceEditPage() {
  return <BillingInvoiceActionPage />;
}


