import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { RequestForPaymentAction } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/Action";

const PageTitle = "View Request For Payment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRequestForPaymentViewPage() {
  return <RequestForPaymentAction />;
}


