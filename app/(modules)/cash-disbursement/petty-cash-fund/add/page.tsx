import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { PettyCashFundActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/PettyCashFundActionPage";

const PageTitle = "Add Petty Cash Fund";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashFundAddPage() {
  return <PettyCashFundActionPage />;
}


