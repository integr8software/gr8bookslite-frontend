import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { BillingStatementAction } from "@/app/src/ui/modules/sales/billing-statement/Action";

const PageTitle = "Add Billing Statement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingStatementAddPage() {
  return <BillingStatementAction />;
}


