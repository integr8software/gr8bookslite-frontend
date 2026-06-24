import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FinancialJournalLedgerMain } from "@/app/src/ui/modules/reports/financial/journal-ledger/Main";

const PageTitle = "Journal Ledger";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialJournalLedgerPage() {
  return <FinancialJournalLedgerMain />;
}


