import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RevolvingFundReplenishmentActionModes } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { RevolvingFundReplenishmentActionPage } from "@/app/src/ui/modules/cash-disbursement/revolving-fund-replenishment/action/RevolvingFundReplenishmentActionPage";

const PageTitle = "Add Revolving Fund Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRevolvingFundReplenishmentAddPage() {
  return <RevolvingFundReplenishmentActionPage mode={RevolvingFundReplenishmentActionModes.Add} />;
}
