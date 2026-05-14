import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { CashAdvanceMultipleEntryAction } from "@/app/src/ui/modules/cash-disbursement/cash-advance-multiple-entry/Action";

const PageTitle = "Edit Cash Advance Multiple Entry";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceMultipleEntryEditPage() {
  return <CashAdvanceMultipleEntryAction />;
}


