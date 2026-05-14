import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ChartsOfAccountsMain } from "@/app/src/ui/modules/maintenance/FinancialManagement/ChartsOfAccounts";

const PageTitle = "Charts Of Accounts";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ChartsOfAccountsPage() {
  return <ChartsOfAccountsMain />;
}


