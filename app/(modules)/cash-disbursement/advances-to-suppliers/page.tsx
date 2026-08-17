import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AdvancesToSuppliersOverviewPage } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/overview/AdvancesToSuppliersOverviewPage";

const PageTitle = "Advances To Suppliers";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementAdvancesToSuppliersPage() {
  return <AdvancesToSuppliersOverviewPage />;
}


