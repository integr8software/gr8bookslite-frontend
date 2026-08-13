import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { BillingStatementActionPage } from "@/app/src/ui/modules/sales/billing-statement/form/BillingStatementActionPage";

const PageTitle = "Edit Billing Statement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function SalesBillingStatementEditPage() {
  return <BillingStatementActionPage />;
}
