import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashReplenishmentMain } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/Main";

const PageTitle = "Petty Cash Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashReplenishmentPage() {
  return <PettyCashReplenishmentMain />;
}


