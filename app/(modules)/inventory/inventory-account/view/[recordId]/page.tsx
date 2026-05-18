import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryAccountAction } from "@/app/src/ui/modules/inventory/inventory-account/Action";

const PageTitle = "View Inventory Account";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function InventoryInventoryAccountViewPage() {
  return <InventoryAccountAction />;
}


