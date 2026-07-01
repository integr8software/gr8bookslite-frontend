import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BillingAction } from "@/app/src/ui/modules/sales/billing/Action";

const PageTitle = "Add Billing";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingAddPage() {
  return <BillingAction />;
}


