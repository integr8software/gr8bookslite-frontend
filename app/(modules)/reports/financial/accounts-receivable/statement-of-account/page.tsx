import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FinancialAccountsReceivableStatementOfAccountMain } from "@/app/src/ui/modules/reports/financial/accounts-receivable/statement-of-account/Main";

const PageTitle = "Statement Of Account";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialAccountsReceivableStatementOfAccountPage() {
  return <FinancialAccountsReceivableStatementOfAccountMain />;
}


