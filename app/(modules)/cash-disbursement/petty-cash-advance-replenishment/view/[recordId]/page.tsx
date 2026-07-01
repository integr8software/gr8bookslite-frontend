import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashAdvanceReplenishmentActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-advance-replenishment/PettyCashAdvanceReplenishmentActionPage";

const PageTitle = "View Petty Cash Advance Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashAdvanceReplenishmentViewPage() {
  return <PettyCashAdvanceReplenishmentActionPage />;
}
