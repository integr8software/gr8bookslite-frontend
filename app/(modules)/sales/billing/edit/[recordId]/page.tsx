import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BillingAction } from "@/app/src/ui/modules/sales/billing/Action";

const PageTitle = "Edit Billing";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingEditPage() {
  return <BillingAction />;
}


