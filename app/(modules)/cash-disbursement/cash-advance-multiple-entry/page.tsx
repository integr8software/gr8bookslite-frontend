import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { CashAdvanceMultipleEntryMain } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/Main";

const PageTitle = "Cash Advance Multiple Entry";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceMultipleEntryPage() {
  return <CashAdvanceMultipleEntryMain />;
}


