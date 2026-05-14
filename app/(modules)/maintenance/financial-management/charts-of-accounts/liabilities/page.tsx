import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ChartsOfAccountsLiabilities } from "@/app/src/ui/modules/maintenance/FinancialManagement/ChartsOfAccounts";

const PageTitle = "Liabilities";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ChartsOfAccountsLiabilitiesPage() {
  return <ChartsOfAccountsLiabilities />;
}


