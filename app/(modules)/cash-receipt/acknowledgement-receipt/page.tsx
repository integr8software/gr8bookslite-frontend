import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AcknowledgementReceiptMain } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/Main";

const PageTitle = "Acknowledgement Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptAcknowledgementReceiptPage() {
  return <AcknowledgementReceiptMain />;
}


