import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FinancialMain } from "@/app/src/ui/modules/reports/financial/Main";

const PageTitle = "Financial";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialPage() {
  return <FinancialMain />;
}


