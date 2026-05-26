import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FinancialIncomeStatementMain } from "@/app/src/ui/modules/reports/financial/income-statement/Main";

const PageTitle = "Income Statement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialIncomeStatementPage() {
  return <FinancialIncomeStatementMain />;
}


