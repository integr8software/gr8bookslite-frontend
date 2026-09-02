import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashReplenishmentActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/action/PettyCashReplenishmentActionPage";

const PageTitle = "View Petty Cash Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashReplenishmentViewPage() {
  return <PettyCashReplenishmentActionPage mode="view" />;
}

