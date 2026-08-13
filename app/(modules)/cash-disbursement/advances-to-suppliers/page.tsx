import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AdvancesToSuppliersListPage } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersListPage";

const PageTitle = "Advances To Suppliers";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementAdvancesToSuppliersPage() {
  return <AdvancesToSuppliersListPage />;
}


