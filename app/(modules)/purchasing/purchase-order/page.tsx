import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PurchaseOrderOverviewPage } from "@/app/src/ui/modules/purchasing/purchase-order/overview/PurchaseOrderOverviewPage";

const PageTitle = "Purchase Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseOrderPage() {
  return <PurchaseOrderOverviewPage />;
}


