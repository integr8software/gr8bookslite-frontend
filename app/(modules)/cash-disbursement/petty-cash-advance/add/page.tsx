import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashAdvanceAction } from "@/app/src/ui/modules/cash-disbursement/petty-cash-advance/Action";

const PageTitle = "Add Petty Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashAdvanceAddPage() {
  return <PettyCashAdvanceAction />;
}


