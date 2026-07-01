import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DeliveryReceiptMain } from "@/app/src/ui/modules/inventory/delivery-receipt/Main";

const PageTitle = "Delivery Receipt";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryDeliveryReceiptPage() {
  return <DeliveryReceiptMain />;
}


