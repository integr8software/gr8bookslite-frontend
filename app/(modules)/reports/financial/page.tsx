import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { FinancialMain } from "@/app/src/ui/modules/reports/financial/Main";

const PageTitle = "Financial";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialPage() {
  return <FinancialMain />;
}


