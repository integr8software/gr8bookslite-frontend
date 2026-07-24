import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PurchaseOrderActionPage } from "@/app/src/ui/modules/purchasing/purchase-order/action/PurchaseOrderActionPage";

const PageTitle = "Add Purchase Order";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function PurchasingPurchaseOrderAddPage() {
  return <PurchaseOrderActionPage />;
}


