import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { RequestForPaymentOverviewPage } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/overview/RequestForPaymentOverviewPage";

const PageTitle = "Request for Payment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRequestForPaymentPage() {
  return <RequestForPaymentOverviewPage />;
}
