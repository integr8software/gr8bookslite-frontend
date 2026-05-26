import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { ServiceInvoiceAction } from "@/app/src/ui/modules/sales/service-invoice/Action";

const PageTitle = "View Service Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesServiceInvoiceViewPage() {
  return <ServiceInvoiceAction />;
}


