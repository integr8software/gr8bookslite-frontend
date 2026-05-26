import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashReplenishmentFormPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentFormPage";

const PageTitle = "Add Petty Cash Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashReplenishmentAddPage() {
  return <PettyCashReplenishmentFormPage />;
}


