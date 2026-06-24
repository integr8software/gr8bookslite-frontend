import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DeliveryReceiptAction } from "@/app/src/ui/modules/inventory/delivery-receipt/Action";

const PageTitle = "View Delivery Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryDeliveryReceiptViewPage() {
  return <DeliveryReceiptAction />;
}


