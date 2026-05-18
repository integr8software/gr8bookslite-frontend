import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ChartsOfAccountsExpenses } from "@/app/src/ui/modules/maintenance/FinancialManagement/ChartsOfAccounts";

const PageTitle = "Expenses";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ChartsOfAccountsExpensesPage() {
  return <ChartsOfAccountsExpenses />;
}


