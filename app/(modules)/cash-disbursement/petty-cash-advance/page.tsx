import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashAdvanceMain } from "@/app/src/ui/modules/cash-disbursement/petty-cash-advance/Main";

const PageTitle = "Petty Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashAdvancePage() {
  return <PettyCashAdvanceMain />;
}


