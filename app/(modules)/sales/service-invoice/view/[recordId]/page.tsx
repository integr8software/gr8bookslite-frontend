import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ServiceInvoiceActionPage } from "@/app/src/ui/modules/sales/service-invoice/action/ServiceInvoiceActionPage";

const PageTitle = "View Service Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesServiceInvoiceViewPage() {
  return <ServiceInvoiceActionPage />;
}


