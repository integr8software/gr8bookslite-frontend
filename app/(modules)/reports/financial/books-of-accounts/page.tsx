import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { FinancialBooksOfAccountsMain } from "@/app/src/ui/modules/reports/financial/books-of-accounts/Main";

const PageTitle = "Books Of Accounts";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsFinancialBooksOfAccountsPage() {
  return <FinancialBooksOfAccountsMain />;
}


