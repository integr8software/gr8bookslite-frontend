import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DeliveryReceiptAction } from "@/app/src/ui/modules/inventory/delivery-receipt/Action";

const PageTitle = "Add Delivery Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryDeliveryReceiptAddPage() {
  return <DeliveryReceiptAction />;
}


