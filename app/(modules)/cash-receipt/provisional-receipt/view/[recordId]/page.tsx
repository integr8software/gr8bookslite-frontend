import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { ProvisionalReceiptAction } from "@/app/src/ui/modules/cash-receipt/provisional-receipt/Action";

const PageTitle = "View Provisional Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptProvisionalReceiptViewPage() {
  return <ProvisionalReceiptAction />;
}


