import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RevolvingFundActionModes } from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import { RevolvingFundActionPage } from "@/app/src/ui/modules/cash-disbursement/revolving-fund/action/RevolvingFundActionPage";

const PageTitle = "View Revolving Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRevolvingFundViewPage() {
  return <RevolvingFundActionPage mode={RevolvingFundActionModes.View} />;
}
