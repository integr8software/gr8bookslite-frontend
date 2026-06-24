import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FinancialAccountsReceivableAgingMain } from "@/app/src/ui/modules/reports/financial/accounts-receivable/aging/Main";

const PageTitle = "Aging";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialAccountsReceivableAgingPage() {
  return <FinancialAccountsReceivableAgingMain />;
}


