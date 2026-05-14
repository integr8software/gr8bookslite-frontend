import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemUomMain } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-uom/Main";

const PageTitle = "Item UOM";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemUomPage() {
  return <InventoryWarehouseManagementItemUomMain />;
}


