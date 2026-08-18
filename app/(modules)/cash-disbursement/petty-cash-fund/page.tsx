import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashFundOverviewPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/overview/PettyCashFundOverviewPage";

const PageTitle = "Petty Cash Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundPage() {
  return <PettyCashFundOverviewPage />;
}
