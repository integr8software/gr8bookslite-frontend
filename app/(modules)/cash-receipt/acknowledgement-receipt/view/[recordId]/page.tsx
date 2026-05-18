import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { AcknowledgementReceiptAction } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/Action";

const PageTitle = "View Acknowledgement Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptAcknowledgementReceiptViewPage() {
  return <AcknowledgementReceiptAction />;
}


