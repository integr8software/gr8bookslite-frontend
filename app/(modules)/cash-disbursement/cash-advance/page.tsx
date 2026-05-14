import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { CashAdvanceMain } from "@/app/src/ui/modules/cash-disbursement/cash-advance/Main";

const PageTitle = "Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvancePage() {
  return <CashAdvanceMain />;
}


