import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashAdvanceAction } from "@/app/src/ui/modules/cash-disbursement/petty-cash-advance/Action";

const PageTitle = "View Petty Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashAdvanceViewPage() {
  return <PettyCashAdvanceAction />;
}


