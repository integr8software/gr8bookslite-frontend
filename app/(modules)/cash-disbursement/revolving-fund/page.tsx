import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { RevolvingFundPage } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/RevolvingFundPage";

const PageTitle = "Revolving Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRevolvingFundPage() {
  return <RevolvingFundPage />;
}
