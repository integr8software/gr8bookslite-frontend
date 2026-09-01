import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashReplenishmentOverviewPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/overview/PettyCashReplenishmentOverviewPage";

const PageTitle = "Petty Cash Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashReplenishmentPage() {
  return <PettyCashReplenishmentOverviewPage />;
}

