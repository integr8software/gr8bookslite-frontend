import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RevolvingFundListPage } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/RevolvingFundListPage";

const PageTitle = "Revolving Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRevolvingFundListPage() {
  return <RevolvingFundListPage />;
}
