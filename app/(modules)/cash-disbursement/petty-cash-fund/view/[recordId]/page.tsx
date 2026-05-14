import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashFundAction } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/Action";

const PageTitle = "View Petty Cash Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundViewPage() {
  return <PettyCashFundAction />;
}


