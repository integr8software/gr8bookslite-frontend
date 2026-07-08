import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { AcknowledgementReceiptActionPage } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptActionPage";

const PageTitle = "Add Acknowledgement Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashReceiptAcknowledgementReceiptAddPage() {
  return <AcknowledgementReceiptActionPage />;
}


