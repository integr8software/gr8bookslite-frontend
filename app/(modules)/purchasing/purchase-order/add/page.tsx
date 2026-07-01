import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PurchaseOrderAction } from "@/app/src/ui/modules/purchasing/purchase-order/Action";

const PageTitle = "Add Purchase Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseOrderAddPage() {
  return <PurchaseOrderAction />;
}


