import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashReplenishmentAction } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/Action";

const PageTitle = "Edit Petty Cash Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashReplenishmentEditPage() {
  return <PettyCashReplenishmentAction />;
}


