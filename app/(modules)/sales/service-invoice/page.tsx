import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ServiceInvoiceMain } from "@/app/src/ui/modules/sales/service-invoice/Main";

const PageTitle = "Service Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesServiceInvoicePage() {
  return <ServiceInvoiceMain />;
}


