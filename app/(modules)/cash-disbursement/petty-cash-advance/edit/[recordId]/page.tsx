import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PettyCashAdvanceActionPage } from "@/app/src/ui/modules/cash-disbursement/petty-cash-advance/PettyCashAdvanceActionPage";

const PageTitle = "Edit Petty Cash Advance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashAdvanceEditPage() {
  return <PettyCashAdvanceActionPage />;
}


