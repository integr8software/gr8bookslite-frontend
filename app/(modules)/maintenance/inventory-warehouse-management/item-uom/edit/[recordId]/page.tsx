import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { InventoryWarehouseManagementItemUomAction } from "@/app/src/ui/modules/maintenance/inventory-warehouse-management/item-uom/Action";

const PageTitle = "Edit Item UOM";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceInventoryWarehouseManagementItemUomEditPage() {
  return <InventoryWarehouseManagementItemUomAction />;
}


