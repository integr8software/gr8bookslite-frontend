import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashAdvanceReplenishmentFormPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-advance-replenishment/PettyCashAdvanceReplenishmentFormPage";

const PageTitle = "View Petty Cash Advance Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashAdvanceReplenishmentViewPage() {
  return <PettyCashAdvanceReplenishmentFormPage />;
}
