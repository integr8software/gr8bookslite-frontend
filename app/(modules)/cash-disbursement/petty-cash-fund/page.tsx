import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashFundListPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/PettyCashFundListPage";

const PageTitle = "Petty Cash Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundPage() {
  return <PettyCashFundListPage />;
}


