import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ProvisionalReceiptMain } from "@/app/src/ui/modules/cash-receipt/provisional-receipt/Main";

const PageTitle = "Provisional Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptProvisionalReceiptPage() {
  return <ProvisionalReceiptMain />;
}


