import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { RevolvingFundFormPage } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/RevolvingFundFormPage";

const PageTitle = "View Revolving Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRevolvingFundViewPage() {
  return <RevolvingFundFormPage />;
}
