import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PurchaseRequestOverviewPage } from "@/app/src/ui/modules/purchasing/purchase-request/overview/PurchaseRequestOverviewPage";

const PageTitle = "Purchase Request";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseRequestPage() {
  return <PurchaseRequestOverviewPage />;
}


