import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { RequestForPaymentActionPage } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/RequestForPaymentActionPage";

const PageTitle = "Add Request For Payment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRequestForPaymentAddPage() {
  return <RequestForPaymentActionPage />;
}


