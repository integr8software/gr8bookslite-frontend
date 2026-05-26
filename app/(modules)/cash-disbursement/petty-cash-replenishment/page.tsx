import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashReplenishmentListPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentListPage";

const PageTitle = "Petty Cash Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashReplenishmentPage() {
  return <PettyCashReplenishmentListPage />;
}


