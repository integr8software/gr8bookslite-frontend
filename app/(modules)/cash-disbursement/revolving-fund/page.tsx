import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RevolvingFundOverviewPage } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/overview/RevolvingFundOverviewPage";

const PageTitle = "Revolving Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRevolvingFundListPage() {
  return <RevolvingFundOverviewPage />;
}
