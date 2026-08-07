import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BillingListPage } from "@/app/src/ui/modules/sales/billing/overview/BillingListPage";

const PageTitle = "Billing";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingPage() {
  return <BillingListPage />;
}


