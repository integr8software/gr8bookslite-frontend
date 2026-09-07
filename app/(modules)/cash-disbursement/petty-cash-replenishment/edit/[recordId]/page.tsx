import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashReplenishmentActionModes } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { PettyCashReplenishmentActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/action/PettyCashReplenishmentActionPage";

const PageTitle = "Edit Petty Cash Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashReplenishmentEditPage() {
  return <PettyCashReplenishmentActionPage mode={PettyCashReplenishmentActionModes.Edit} />;
}

