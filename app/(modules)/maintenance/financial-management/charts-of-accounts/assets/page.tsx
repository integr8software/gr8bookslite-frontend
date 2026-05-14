import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ChartsOfAccountsAssets } from "@/app/src/ui/modules/maintenance/FinancialManagement/ChartsOfAccounts";

const PageTitle = "Assets";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ChartsOfAccountsAssetsPage() {
  return <ChartsOfAccountsAssets />;
}


