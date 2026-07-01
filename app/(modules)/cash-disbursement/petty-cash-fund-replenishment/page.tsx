import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashFundReplenishmentListPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentListPage";

const PageTitle = "Petty Cash Fund Replenishment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundReplenishmentPage() {
  return <PettyCashFundReplenishmentListPage />;
}


