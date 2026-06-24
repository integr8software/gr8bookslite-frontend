import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FinancialBeginningBalanceSubsidiaryLedgerUploaderMain } from "@/app/src/ui/modules/reports/financial/beginning-balance-subsidiary-ledger-uploader/Main";

const PageTitle = "Beginning Balance Subsidiary Ledger Uploader";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialBeginningBalanceSubsidiaryLedgerUploaderPage() {
  return <FinancialBeginningBalanceSubsidiaryLedgerUploaderMain />;
}
