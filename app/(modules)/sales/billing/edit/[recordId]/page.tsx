import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BillingActionPage } from "@/app/src/ui/modules/sales/billing/form/BillingActionPage";

const PageTitle = "Edit Billing";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingEditPage() {
  return <BillingActionPage />;
}
