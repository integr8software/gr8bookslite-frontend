import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseOrderAction } from "@/app/src/ui/modules/purchasing/purchase-order/Action";

const PageTitle = "View Purchase Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseOrderViewPage() {
  return <PurchaseOrderAction />;
}


