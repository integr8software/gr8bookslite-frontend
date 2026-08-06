import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DeliveryReceiptActionPage } from "@/app/src/ui/modules/inventory/delivery-receipt/action/DeliveryReceiptPage";

const PageTitle = "View Delivery Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryDeliveryReceiptViewPage() {
  return <DeliveryReceiptActionPage />;
}
