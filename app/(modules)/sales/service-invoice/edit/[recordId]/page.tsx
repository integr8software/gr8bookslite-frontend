import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ServiceInvoiceActionPage } from "@/app/src/ui/modules/sales/service-invoice/ServiceInvoiceActionPage";

const PageTitle = "Edit Service Invoice";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesServiceInvoiceEditPage() {
  return <ServiceInvoiceActionPage />;
}


