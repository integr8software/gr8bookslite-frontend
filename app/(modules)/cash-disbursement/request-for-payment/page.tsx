import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { RequestForPaymentMain } from "@/app/src/ui/modules/cash-disbursement/request-for-payment/Main";

const PageTitle = "Request For Payment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function CashDisbursementRequestForPaymentPage() {
  return <RequestForPaymentMain />;
}


