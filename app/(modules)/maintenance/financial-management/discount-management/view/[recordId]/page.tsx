import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { FinancialManagementDiscountManagementAction } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/Action";

const PageTitle = "View Discount Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementDiscountManagementViewPage() {
  return <FinancialManagementDiscountManagementAction />;
}


