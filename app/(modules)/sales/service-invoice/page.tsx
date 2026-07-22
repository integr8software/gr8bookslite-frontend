import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ServiceInvoiceListPage } from "@/app/src/ui/modules/sales/service-invoice/overview/ServiceInvoiceListPage";

const PageTitle = "Service Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesServiceInvoicePage() {
  return <ServiceInvoiceListPage />;
}
