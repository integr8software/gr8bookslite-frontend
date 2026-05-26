import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FinancialCashFlowStatementMain } from "@/app/src/ui/modules/reports/financial/cash-flow-statement/Main";

const PageTitle = "Cash Flow Statement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialCashFlowStatementPage() {
  return <FinancialCashFlowStatementMain />;
}


