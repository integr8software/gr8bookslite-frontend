import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashFundActionModes } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { PettyCashFundActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundActionPage";

const PageTitle = "View Petty Cash Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundViewPage() {
  return <PettyCashFundActionPage mode={PettyCashFundActionModes.View} />;
}
