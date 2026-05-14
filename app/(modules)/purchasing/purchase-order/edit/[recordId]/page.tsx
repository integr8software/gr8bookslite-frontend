import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { PurchaseOrderAction } from "@/app/src/ui/modules/purchasing/purchase-order/Action";

const PageTitle = "Edit Purchase Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseOrderEditPage() {
  return <PurchaseOrderAction />;
}


