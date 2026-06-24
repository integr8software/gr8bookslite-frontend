import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FinancialGeneralLedgerMain } from "@/app/src/ui/modules/reports/financial/general-ledger/Main";

const PageTitle = "General Ledger";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialGeneralLedgerPage() {
  return <FinancialGeneralLedgerMain />;
}


