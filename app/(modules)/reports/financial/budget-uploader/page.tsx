import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { FinancialBudgetUploaderMain } from "@/app/src/ui/modules/reports/financial/budget-uploader/Main";

const PageTitle = "Budget Uploader";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialBudgetUploaderPage() {
  return <FinancialBudgetUploaderMain />;
}
