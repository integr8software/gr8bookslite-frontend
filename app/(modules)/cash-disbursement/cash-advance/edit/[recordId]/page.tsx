import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { CashAdvanceAction } from "@/app/src/ui/modules/cash-disbursement/cash-advance/Action";

const PageTitle = "Edit Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceEditPage() {
  return <CashAdvanceAction />;
}


