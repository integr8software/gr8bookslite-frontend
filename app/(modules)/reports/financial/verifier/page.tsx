import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FinancialVerifierMain } from "@/app/src/ui/modules/reports/financial/verifier/Main";

const PageTitle = "Verifier";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialVerifierPage() {
  return <FinancialVerifierMain />;
}
