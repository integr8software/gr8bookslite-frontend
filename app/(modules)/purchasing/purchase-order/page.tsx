import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseOrderMain } from "@/app/src/ui/modules/purchasing/purchase-order/Main";

const PageTitle = "Purchase Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseOrderPage() {
  return <PurchaseOrderMain />;
}


