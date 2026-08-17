import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RevolvingFundReplenishmentOverviewPage } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/overview/RevolvingFundReplenishmentOverviewPage";

const PageTitle = "Revolving Fund Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRevolvingFundReplenishmentPage() {
  return <RevolvingFundReplenishmentOverviewPage />;
}
