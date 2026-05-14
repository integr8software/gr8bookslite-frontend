import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ChartsOfAccountsCostOfSales } from "@/app/src/ui/modules/maintenance/FinancialManagement/ChartsOfAccounts";

const PageTitle = "Cost Of Sales";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ChartsOfAccountsCostOfSalesPage() {
  return <ChartsOfAccountsCostOfSales />;
}


