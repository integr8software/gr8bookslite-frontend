import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BillingStatementActionPage } from "@/app/src/ui/modules/sales/billing-statement/action/BillingStatementActionPage";

const PageTitle = "View Billing Statement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingStatementViewPage() {
  return <BillingStatementActionPage />;
}


