import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BillingStatementAction } from "@/app/src/ui/modules/sales/billing-statement/Action";

const PageTitle = "Edit Billing Statement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingStatementEditPage() {
  return <BillingStatementAction />;
}


