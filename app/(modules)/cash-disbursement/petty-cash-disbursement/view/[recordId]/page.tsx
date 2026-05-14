import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PettyCashDisbursementAction } from "@/app/src/ui/modules/cash-disbursement/petty-cash-disbursement/Action";

const PageTitle = "View Petty Cash Disbursement";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementPettyCashDisbursementViewPage() {
  return <PettyCashDisbursementAction />;
}


