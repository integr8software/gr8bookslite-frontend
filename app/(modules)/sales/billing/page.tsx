import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { BillingMain } from "@/app/src/ui/modules/sales/billing/Main";

const PageTitle = "Billing";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingPage() {
  return <BillingMain />;
}


