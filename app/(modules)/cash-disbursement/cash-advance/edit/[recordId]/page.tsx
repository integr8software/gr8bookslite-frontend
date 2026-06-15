import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { CashAdvanceActionPage } from "@/app/src/ui/modules/cash-disbursement/cash-advance/CashAdvanceActionPage";

const PageTitle = "Edit Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementCashAdvanceEditPage() {
  return <CashAdvanceActionPage />;
}


