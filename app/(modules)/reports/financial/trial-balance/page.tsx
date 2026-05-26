import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FinancialTrialBalanceMain } from "@/app/src/ui/modules/reports/financial/trial-balance/Main";

const PageTitle = "Trial Balance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialTrialBalancePage() {
  return <FinancialTrialBalanceMain />;
}


