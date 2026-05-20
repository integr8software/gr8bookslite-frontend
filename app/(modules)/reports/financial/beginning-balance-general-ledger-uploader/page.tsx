import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { FinancialBeginningBalanceGeneralLedgerUploaderMain } from "@/app/src/ui/modules/reports/financial/beginning-balance-general-ledger-uploader/Main";

const PageTitle = "Beginning Balance General Ledger Uploader";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialBeginningBalanceGeneralLedgerUploaderPage() {
  return <FinancialBeginningBalanceGeneralLedgerUploaderMain />;
}
