import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashFundReplenishmentActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentActionPage";

const PageTitle = "View Petty Cash Fund Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundReplenishmentViewPage() {
  return <PettyCashFundReplenishmentActionPage />;
}


