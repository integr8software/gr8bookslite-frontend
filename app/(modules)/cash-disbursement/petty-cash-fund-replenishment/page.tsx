import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashFundReplenishmentOverviewPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/overview/PettyCashFundReplenishmentOverviewPage";

const PageTitle = "Petty Cash Fund Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundReplenishmentPage() {
  return <PettyCashFundReplenishmentOverviewPage />;
}


