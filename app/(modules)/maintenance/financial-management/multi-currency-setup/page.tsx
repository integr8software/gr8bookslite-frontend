import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FinancialManagementMultiCurrencySetupMain } from "@/app/src/ui/modules/maintenance/financial-management/multi-currency-setup/Main";

const PageTitle = "Multi Currency Setup";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementMultiCurrencySetupPage() {
  return <FinancialManagementMultiCurrencySetupMain />;
}


