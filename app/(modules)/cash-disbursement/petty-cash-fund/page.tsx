import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashFundMain } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/Main";

const PageTitle = "Petty Cash Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundPage() {
  return <PettyCashFundMain />;
}


