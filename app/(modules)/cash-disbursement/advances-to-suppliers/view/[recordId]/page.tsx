import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AdvancesToSuppliersActionPage } from "@/app/src/ui/modules/cash-disbursement/advances-to-suppliers/action/AdvancesToSuppliersActionPage";

const PageTitle = "View Advances To Suppliers";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementAdvancesToSuppliersViewPage() {
  return <AdvancesToSuppliersActionPage mode="view" />;
}


