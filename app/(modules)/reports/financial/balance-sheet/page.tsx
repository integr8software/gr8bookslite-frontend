import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FinancialBalanceSheetMain } from "@/app/src/ui/modules/reports/financial/balance-sheet/Main";

const PageTitle = "Balance Sheet";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialBalanceSheetPage() {
  return <FinancialBalanceSheetMain />;
}


