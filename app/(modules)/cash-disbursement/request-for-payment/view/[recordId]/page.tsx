import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RequestForPaymentActionPage } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/action/RequestForPaymentActionPage";

const PageTitle = "View Request for Payment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRequestForPaymentViewPage() {
  return <RequestForPaymentActionPage mode="view" />;
}
