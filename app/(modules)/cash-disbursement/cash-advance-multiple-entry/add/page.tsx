import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { CashAdvanceMultipleEntryAction } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/Action";

const PageTitle = "Add Cash Advance Multiple Entry";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceMultipleEntryAddPage() {
  return <CashAdvanceMultipleEntryAction />;
}


