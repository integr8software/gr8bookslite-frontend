import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemSubtypeMain } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-subtype/Main";

const PageTitle = "Item Subtype";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemSubtypePage() {
  return <InventoryWarehouseManagementItemSubtypeMain />;
}


