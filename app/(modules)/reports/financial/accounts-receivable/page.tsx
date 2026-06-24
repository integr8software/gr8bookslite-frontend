import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FinancialAccountsReceivableMain } from "@/app/src/ui/modules/reports/financial/accounts-receivable/Main";

const PageTitle = "Accounts Receivable";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialAccountsReceivablePage() {
  return <FinancialAccountsReceivableMain />;
}


