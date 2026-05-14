import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { FinancialManagementMultiCurrencySetupAction } from "@/app/src/ui/modules/maintenance/financial-management/multi-currency-setup/Action";

const PageTitle = "View Multi Currency Setup";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementMultiCurrencySetupViewPage() {
  return <FinancialManagementMultiCurrencySetupAction />;
}


